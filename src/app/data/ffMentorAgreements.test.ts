import { describe, expect, it } from "vitest";
import {
  assessFFAgreements,
  ffAgreementRows,
} from "./ffMentorAgreements";
import {
  defaultFFMentorApplicationStaff,
  type FFMentorApplication,
} from "./ffMentorApplication";
import { SEED_FF_MENTOR_APPLICATIONS } from "./mockFFMentorApplications";

const staff = defaultFFMentorApplicationStaff();
const make = (
  subPrograms: FFMentorApplication["subPrograms"],
  consent: Partial<
    FFMentorApplication["answers"]["consent"]
  > = {},
  docsSigned: Record<string, boolean> = {},
) => {
  const a = structuredClone(SEED_FF_MENTOR_APPLICATIONS[0]);
  a.subPrograms = subPrograms;
  a.answers.consent = {
    backgroundSig: null,
    attestationSig: null,
    agreements: {},
    quarterlyUpdates: false,
    ...consent,
  };
  a.answers.docsSigned = docsSigned;
  return a;
};
const ids = (a: FFMentorApplication) =>
  ffAgreementRows(a, staff)
    .filter((r) => r.required)
    .map((r) => r.id);
const COMMON = [
  "backgroundConsent",
  "finalAttestation",
  "clientConfidentiality",
  "codeOfEthics",
  "publicityRelease",
  "mentorRights",
  "mandatedReporter",
];

describe("applicable agreements", () => {
  it("CB only", () => {
    expect(ids(make(["community"]))).toEqual([
      ...COMMON,
      "publicTransit",
      "psychScreening",
      "accurateBiometrics",
      "fingerprintConsentCB",
      "mentorDescriptionCB",
    ]);
  });
  it("SB only", () => {
    expect(ids(make(["school"]))).toEqual([
      ...COMMON,
      "accurateBiometrics",
      "fingerprintConsentSB",
      "mentorDescriptionSB",
    ]);
  });
  it("WB only", () => {
    expect(ids(make(["work"]))).toEqual([
      ...COMMON,
      "mentorDescriptionWB",
    ]);
  });
  it("all three: every distinct variant once, common ones not duplicated", () => {
    const list = ids(make(["community", "school", "work"]));
    expect(list).toEqual([
      ...COMMON,
      "publicTransit",
      "psychScreening",
      "accurateBiometrics",
      "fingerprintConsentCB",
      "fingerprintConsentSB",
      "mentorDescriptionCB",
      "mentorDescriptionSB",
      "mentorDescriptionWB",
    ]);
    expect(new Set(list).size).toBe(list.length);
    const bio = ffAgreementRows(
      make(["community", "school", "work"]),
      staff,
    ).find((r) => r.id === "accurateBiometrics")!;
    expect(bio.appliesTo).toEqual(["community", "school"]);
  });
});

describe("signature status", () => {
  it("a signature on one program's form doesn't satisfy another's", () => {
    const rows = ffAgreementRows(
      make(["community", "school"], {
        agreements: {
          fingerprintConsentCB:
            "October 1, 2026 at 10:00:00 AM",
          mentorDescriptionCB: "October 1, 2026 at 10:01:00 AM",
        },
      }),
      staff,
    );
    const st = (id: string) =>
      rows.find((r) => r.id === id)!.status;
    expect(st("fingerprintConsentCB")).toBe(
      "Signed and Agreed",
    );
    expect(st("fingerprintConsentSB")).toBe(
      "Signature Required",
    );
    expect(st("mentorDescriptionSB")).toBe(
      "Signature Required",
    );
  });
  it("typed and drawn signatures keep their recorded details; no method assumed", () => {
    const png = "data:image/png;base64,iVBORw0KGgo=";
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "Original Name",
          signedAt: "09/14/2026 10:42 AM",
          method: "type",
        },
        attestationSig: {
          signedAs: "handwritten signature",
          signedAt: "09/14/2026 10:44 AM",
          method: "draw",
          drawnPreview: png,
        },
      }),
      staff,
    );
    const bg = rows.find((r) => r.id === "backgroundConsent")!;
    const at = rows.find((r) => r.id === "finalAttestation")!;
    expect(bg).toMatchObject({
      status: "Signed and Agreed",
      signedAs: "Original Name",
      signedAt: "09/14/2026 10:42 AM",
      method: "type",
    });
    expect(bg.preview).toBeUndefined();
    expect(at).toMatchObject({ method: "draw", preview: png });
    const noMethod = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
        },
      }),
      staff,
    ).find((r) => r.id === "backgroundConsent")!;
    expect(noMethod.method).toBeUndefined();
    const badPreview = ffAgreementRows(
      make(["work"], {
        attestationSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
          method: "draw",
          drawnPreview: "javascript:alert(1)",
        },
      }),
      staff,
    ).find((r) => r.id === "finalAttestation")!;
    expect(badPreview.preview).toBeUndefined();
    expect(badPreview.status).toBe("Signed and Agreed");
  });
  it("incomplete, conflicting, undated or unavailable evidence is Unverified, not signed or missing", () => {
    const rows = ffAgreementRows(
      make(
        ["community"],
        {
          backgroundSig: { signedAs: "A", signedAt: "" },
          agreements: {
            codeOfEthics: "October 1, 2026 at 9:00:00 AM",
            publicTransit: "",
          },
        },
        { codeOfEthics: false, clientConfidentiality: true },
      ),
      staff,
    );
    const st = (id: string) => rows.find((r) => r.id === id)!;
    expect(st("backgroundConsent")).toMatchObject({
      status: "Unverified",
    });
    expect(st("codeOfEthics")).toMatchObject({
      status: "Unverified",
      issue: "The saved signing records conflict.",
    });
    expect(st("publicTransit").status).toBe("Unverified");
    expect(st("clientConfidentiality").issue).toContain(
      "no signing date/time",
    );
    expect(st("mentorRights").status).toBe(
      "Signature Required",
    );
    const noConsent = make(["work"]);
    delete (
      noConsent.answers as Partial<
        FFMentorApplication["answers"]
      >
    ).consent;
    expect(
      ffAgreementRows(noConsent, staff).every(
        (r) => r.status === "Unverified",
      ),
    ).toBe(true);
  });
  it("review comes only from review records, never the signer", () => {
    const s = {
      ...staff,
      documentReviews: {
        codeOfEthics: {
          status: "approved" as const,
          reviewedBy: "Reviewer R",
          reviewedAt: "10/10/2026",
        },
      },
    };
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "Signer S",
          signedAt: "09/01/2026 9:00 AM",
        },
        agreements: {
          codeOfEthics: "September 1, 2026 at 9:01:00 AM",
        },
      }),
      s,
    );
    expect(
      rows.find((r) => r.id === "codeOfEthics")!.review
        ?.reviewedBy,
    ).toBe("Reviewer R");
    expect(
      rows.find((r) => r.id === "backgroundConsent")!.review,
    ).toBeUndefined();
  });
  it("additional saved agreements are listed separately and never substitute a required form", () => {
    const rows = ffAgreementRows(
      make(
        ["community"],
        {
          agreements: { publicTransitAgreement: "2026-09-01" },
        },
        {
          publicTransitAgreement: true,
          cbMentorAgreement: true,
        },
      ),
      staff,
    );
    expect(
      rows.find((r) => r.id === "publicTransit")!.status,
    ).toBe("Signature Required");
    const extra = rows.filter((r) => !r.required);
    expect(extra.map((r) => [r.id, r.status])).toEqual([
      ["publicTransitAgreement", "Signed and Agreed"],
      ["cbMentorAgreement", "Unverified"],
    ]);
  });
  it("invalid or unrecognizable timestamps are Unverified; valid formats are accepted", () => {
    const rows = ffAgreementRows(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "sometime last week",
        },
        attestationSig: {
          signedAs: "A",
          signedAt: "02/30/2026 9:00 AM",
        },
        agreements: {
          codeOfEthics: "September 31, 2026 at 9:00:00 AM",
          clientConfidentiality:
            "September 30, 2026 at 9:58:01 AM",
          mentorRights: "2026-09-30T14:05:00.000Z",
          publicityRelease: "13/01/2026",
        },
      }),
      staff,
    );
    const st = (id: string) => rows.find((r) => r.id === id)!;
    expect(st("backgroundConsent")).toMatchObject({
      status: "Unverified",
      signedAt: "sometime last week",
    });
    expect(st("finalAttestation").status).toBe("Unverified");
    expect(st("codeOfEthics").status).toBe("Unverified");
    expect(st("publicityRelease").status).toBe("Unverified");
    expect(st("clientConfidentiality").status).toBe(
      "Signed and Agreed",
    );
    expect(st("mentorRights").status).toBe("Signed and Agreed");
  });

  it("assessment lists applicable, signed, missing and unverified", () => {
    const a = assessFFAgreements(
      make(["work"], {
        backgroundSig: {
          signedAs: "A",
          signedAt: "09/01/2026 9:00 AM",
        },
        attestationSig: {
          signedAs: "",
          signedAt: "09/01/2026 9:00 AM",
        },
      }),
      staff,
    );
    expect(a.applicable).toHaveLength(8);
    expect(a.signed).toEqual(["backgroundConsent"]);
    expect(a.unverified.map((u) => u.id)).toEqual([
      "finalAttestation",
    ]);
    expect(a.missing).toHaveLength(6);
  });
});