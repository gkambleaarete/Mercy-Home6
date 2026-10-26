// Friends First Mentor Application — consents and signed agreements
// (US 20039 Chunk 7). Read-only: derives each required agreement's signing
// status from what the VMS Mentor Application Wizard saved, and never
// creates signatures, dates or reviews.
//
// What the wizard saves (FFWizards.tsx):
//   • Document agreements: consent.agreements[<key>] = the date/time "Sign
//     Document" was clicked. No signer name, method, image or signed text.
//   • Background & Driving Check Consent: consent.backgroundSig
//     { signedAs, signedAt } (method only when recorded).
//   • Final Attestation: consent.attestationSig (same shape).
//   • docsSigned: older per-document flags with no date.

import {
  FF_SUB_PROGRAM_NAME,
  parseRecordedDate,
  type FFDocumentReview,
  type FFMentorApplication,
  type FFMentorApplicationStaff,
  type FFSignature,
  type FFSubProgramId,
} from "./ffMentorApplication";

const ALL: FFSubProgramId[] = ["community", "school", "work"];

export interface FFAgreementDefinition {
  /** Stable agreement id; the wizard's own key for document agreements. */
  id: string;
  name: string;
  category: string;
  /** Applies when any of these sub-programs is selected. */
  programs: FFSubProgramId[];
  /** Where the signing evidence is saved. */
  source: "agreement" | "backgroundSig" | "attestationSig";
}

/**
 * Required agreements, keyed exactly as the wizard keys them. Program-
 * specific forms are separate entries (CB and SB fingerprint forms, three
 * Mentor Description forms) and never stand in for one another.
 */
export const FF_AGREEMENT_DEFINITIONS: FFAgreementDefinition[] =
  [
    {
      id: "backgroundConsent",
      name: "Background & Driving Check Consent",
      category: "Consent",
      programs: ALL,
      source: "backgroundSig",
    },
    {
      id: "finalAttestation",
      name: "Final Attestation",
      category: "Attestation",
      programs: ALL,
      source: "attestationSig",
    },
    {
      id: "clientConfidentiality",
      name: "Client Confidentiality Agreement",
      category: "Agreement",
      programs: ALL,
      source: "agreement",
    },
    {
      id: "codeOfEthics",
      name: "Code of Ethics",
      category: "Agreement",
      programs: ALL,
      source: "agreement",
    },
    {
      id: "publicityRelease",
      name: "Publicity Release",
      category: "Consent",
      programs: ALL,
      source: "agreement",
    },
    {
      id: "mentorRights",
      name: "Mentor Rights & Grievances",
      category: "Agreement",
      programs: ALL,
      source: "agreement",
    },
    {
      id: "mandatedReporter",
      name: "Mandated Reporter Acknowledgement",
      category: "Agreement",
      programs: ALL,
      source: "agreement",
    },
    {
      id: "publicTransit",
      name: "Public Transit Agreement",
      category: "Agreement",
      programs: ["community"],
      source: "agreement",
    },
    {
      id: "psychScreening",
      name: "Psychological Screening Waiver",
      category: "Consent",
      programs: ["community"],
      source: "agreement",
    },
    {
      id: "accurateBiometrics",
      name: "Accurate Biometrics Form",
      category: "Consent",
      programs: ["community", "school"],
      source: "agreement",
    },
    {
      id: "fingerprintConsentCB",
      name: "Fingerprint Submission Consent and Notification Form — Community-Based",
      category: "Consent",
      programs: ["community"],
      source: "agreement",
    },
    {
      id: "fingerprintConsentSB",
      name: "Fingerprint Submission Consent and Notification Form — School-Based",
      category: "Consent",
      programs: ["school"],
      source: "agreement",
    },
    {
      id: "mentorDescriptionCB",
      name: "Mentor Description Form — Community-Based",
      category: "Program Form",
      programs: ["community"],
      source: "agreement",
    },
    {
      id: "mentorDescriptionSB",
      name: "Mentor Description Form — School-Based",
      category: "Program Form",
      programs: ["school"],
      source: "agreement",
    },
    {
      id: "mentorDescriptionWB",
      name: "Mentor Description Form — Work-Based",
      category: "Program Form",
      programs: ["work"],
      source: "agreement",
    },
  ];

/**
 * Names for older agreement keys the wizard has saved (its earlier
 * Community-Based documents). They are shown as additional entries only —
 * never as substitutes for a required form, even with a similar name.
 */
const ADDITIONAL_AGREEMENT_NAMES: Record<string, string> = {
  cbMentorAgreement: "Community-Based Mentor Agreement",
  publicTransitAgreement: "Public Transit Use Agreement",
  psychScreeningWaiver:
    "Psychological Screening Waiver (earlier form)",
  cbConfidentiality: "Confidentiality & Code of Conduct",
};

export type FFAgreementStatus =
  | "Signed and Agreed"
  | "Signature Required"
  | "Unverified"
  | "Not Signed";

export interface FFAgreementRow {
  id: string;
  name: string;
  category: string;
  /** The selected sub-programs this agreement applies to. */
  appliesTo: FFSubProgramId[];
  required: boolean;
  status: FFAgreementStatus;
  /** Why the status can't be verified, when it can't. */
  issue?: string;
  /** Recorded signing date/time, exactly as saved. */
  signedAt?: string;
  /** Recorded signer name, exactly as saved. */
  signedAs?: string;
  method?: "draw" | "type";
  /** A valid saved drawn-signature image, when one exists. */
  preview?: string;
  review?: FFDocumentReview;
}

const INVALID_DATE =
  "The recorded signing date/time isn't a valid date.";
const PREVIEW_RE =
  /^data:image\/(png|jpeg|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
const text = (v: unknown) =>
  typeof v === "string" ? v.trim() : "";

function fromSignature(sig: unknown): Partial<FFAgreementRow> {
  if (sig === null || sig === undefined)
    return { status: "Signature Required" };
  const s = sig as Partial<FFSignature> & {
    drawnPreview?: unknown;
  };
  const signedAs = text(s.signedAs);
  const signedAt = text(s.signedAt);
  const method =
    s.method === "draw" || s.method === "type"
      ? s.method
      : undefined;
  const preview =
    method === "draw" &&
    typeof s.drawnPreview === "string" &&
    PREVIEW_RE.test(s.drawnPreview)
      ? s.drawnPreview
      : undefined;
  const base = {
    signedAs: signedAs || undefined,
    signedAt: signedAt || undefined,
    method,
    preview,
  };
  if (signedAs && signedAt && !parseRecordedDate(signedAt))
    return {
      ...base,
      status: "Unverified",
      issue: INVALID_DATE,
    };
  if (signedAs && signedAt)
    return { ...base, status: "Signed and Agreed" };
  return {
    ...base,
    status: "Unverified",
    issue: `The signing record is incomplete (no ${!signedAt ? "date/time" : "signer name"} was recorded).`,
  };
}

function fromAgreementKey(
  key: string,
  agreements: Record<string, unknown>,
  docsSigned: Record<string, unknown>,
  notSigned: FFAgreementStatus,
): Partial<FFAgreementRow> {
  const stamp = agreements[key];
  const flag = docsSigned[key];
  if (stamp === undefined || stamp === null) {
    if (flag === true)
      return {
        status: "Unverified",
        issue:
          "Marked as signed, but no signing date/time was recorded.",
      };
    return { status: notSigned };
  }
  if (!text(stamp))
    return {
      status: "Unverified",
      issue:
        "The signing record is incomplete (no date/time was recorded).",
    };
  if (!parseRecordedDate(stamp))
    return {
      status: "Unverified",
      signedAt: text(stamp),
      issue: INVALID_DATE,
    };
  if (flag === false)
    return {
      status: "Unverified",
      signedAt: text(stamp),
      issue: "The saved signing records conflict.",
    };
  return { status: "Signed and Agreed", signedAt: text(stamp) };
}

/** Every applicable required agreement, then any additional saved ones. */
export function ffAgreementRows(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
): FFAgreementRow[] {
  const consent = app.answers?.consent as
    | (Partial<FFMentorApplication["answers"]["consent"]> &
        Record<string, unknown>)
    | undefined;
  const available = !!consent && typeof consent === "object";
  const agreements = (
    available &&
    consent!.agreements &&
    typeof consent!.agreements === "object"
      ? consent!.agreements
      : {}
  ) as Record<string, unknown>;
  const docsSigned = (app.answers?.docsSigned ?? {}) as Record<
    string,
    unknown
  >;

  const required = FF_AGREEMENT_DEFINITIONS.filter((d) =>
    d.programs.some((p) => app.subPrograms.includes(p)),
  ).map((d): FFAgreementRow => {
    const evidence: Partial<FFAgreementRow> = !available
      ? {
          status: "Unverified",
          issue:
            "Signing records aren't available for this application.",
        }
      : d.source === "backgroundSig"
        ? fromSignature(consent!.backgroundSig)
        : d.source === "attestationSig"
          ? fromSignature(consent!.attestationSig)
          : fromAgreementKey(
              d.id,
              agreements,
              docsSigned,
              "Signature Required",
            );
    return {
      id: d.id,
      name: d.name,
      category: d.category,
      appliesTo: d.programs.filter((p) =>
        app.subPrograms.includes(p),
      ),
      required: true,
      status: "Signature Required",
      ...evidence,
      review: staff.documentReviews[d.id],
    };
  });

  const known = new Set(
    FF_AGREEMENT_DEFINITIONS.map((d) => d.id),
  );
  const extraKeys = [
    ...new Set([
      ...Object.keys(agreements),
      ...Object.keys(docsSigned),
    ]),
  ].filter((k) => !known.has(k));
  const additional = extraKeys.map((k): FFAgreementRow => ({
    id: k,
    name: ADDITIONAL_AGREEMENT_NAMES[k] ?? k,
    category: "Additional",
    appliesTo: [],
    required: false,
    status: "Not Signed",
    ...fromAgreementKey(
      k,
      agreements,
      docsSigned,
      "Not Signed",
    ),
    review: staff.documentReviews[k],
  }));
  return [...required, ...additional];
}

export interface FFAgreementAssessment {
  applicable: string[];
  signed: string[];
  missing: string[];
  unverified: { id: string; reason: string }[];
}

/** For the later readiness check: required agreements and their evidence. */
export function assessFFAgreements(
  app: FFMentorApplication,
  staff: FFMentorApplicationStaff,
): FFAgreementAssessment {
  const rows = ffAgreementRows(app, staff).filter(
    (r) => r.required,
  );
  return {
    applicable: rows.map((r) => r.id),
    signed: rows
      .filter((r) => r.status === "Signed and Agreed")
      .map((r) => r.id),
    missing: rows
      .filter((r) => r.status === "Signature Required")
      .map((r) => r.id),
    unverified: rows
      .filter((r) => r.status === "Unverified")
      .map((r) => ({ id: r.id, reason: r.issue ?? "" })),
  };
}

export const ffProgramNames = (ids: FFSubProgramId[]) =>
  ids.map((p) => FF_SUB_PROGRAM_NAME[p]).join(", ");