// @vitest-environment jsdom
// Candidate tests with the two unresolved business rules stood in by a
// test policy (vi.mock). Production keeps them unresolved.
import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("./ffMentorReadinessPolicy", () => ({
  FF_READINESS_POLICY: {
    drivingReviewApplies: () => true,
    multiProgramReferencesMet: () => true,
  },
}));
import {
  __reloadFFMentorApplicationsForTest,
  saveFFChecklistAssessments,
} from "./ffMentorApplicationStore";
import {
  autoMatchSubProgram,
  createMentorMatchForCandidate,
  getFFMentorCandidate,
  isFFMentorMatchCandidate,
  listFFMentorCandidates,
} from "./ffMentorCandidates";
import {
  clearFFMentorInactive,
  confirmFFMentorInactive,
} from "./ffMentorInactive";
import {
  __reloadMentorMatchesForTest,
  getMentorMatches,
} from "./mockMentorMatchData";
import { completeApplication } from "./ffMentorTestFixtures";

const APP_KEY = "mh.ffMentorApplications.v1";
const actor = { id: "staff-test", name: "Test Staff" };

function seed() {
  const ok = completeApplication("C-OK", ["community"]);
  const wrongStage = completeApplication("C-STAGE", ["work"]);
  const inelig = completeApplication("C-INEL", ["school"]);
  inelig.staff.documentReviews.virtus.status = "rejected";
  const raw = {
    version: 1,
    applications: {
      "C-OK": ok.app,
      "C-STAGE": wrongStage.app,
      "C-INEL": inelig.app,
    },
    staff: {
      "C-OK": { ...ok.staff, stage: "Ready for Match" },
      "C-STAGE": { ...wrongStage.staff, stage: "Matched" },
      "C-INEL": { ...inelig.staff, stage: "Ready for Match" },
    },
  };
  localStorage.setItem(APP_KEY, JSON.stringify(raw));
  localStorage.setItem("mh.ffMentorMatches.v1", "[]");
  __reloadFFMentorApplicationsForTest();
  __reloadMentorMatchesForTest([]);
}
const draft = (mentorId: string) => ({
  mentorId,
  menteeId: "FF-M-1",
  subProgram: "Community-Based" as const,
  startDate: "10/21/2026",
  startTime: "9:00 AM",
  endDate: "12/31/2026",
  endTime: "5:00 PM",
  days: ["Monday" as const],
  comment: "",
});

beforeEach(() => localStorage.clear());

describe("mentor candidates (resolved test policy)", () => {
  it("only eligible, Ready for Match, not-Inactive mentors qualify; demo mentors never", () => {
    seed();
    const ids = listFFMentorCandidates().map((c) => c.mentorId);
    expect(ids).toEqual(["VOL-C-OK"]);
    expect(ids.some((id) => id.startsWith("FF-"))).toBe(false);
    expect(isFFMentorMatchCandidate("FF-CB-101")).toBe(false);
    expect(isFFMentorMatchCandidate("VOL-C-STAGE")).toBe(false);
    expect(isFFMentorMatchCandidate("VOL-C-INEL")).toBe(false);
  });

  it("Inactive removes a candidate; clearing it restores only an eligible mentor", () => {
    seed();
    confirmFFMentorInactive("VOL-C-OK", actor);
    expect(isFFMentorMatchCandidate("VOL-C-OK")).toBe(false);
    clearFFMentorInactive("VOL-C-OK", actor);
    expect(isFFMentorMatchCandidate("VOL-C-OK")).toBe(true);
    confirmFFMentorInactive("VOL-C-INEL", actor);
    clearFFMentorInactive("VOL-C-INEL", actor);
    expect(isFFMentorMatchCandidate("VOL-C-INEL")).toBe(false);
  });

  it("creating a match rechecks the mentor at save time (stale list refused)", () => {
    seed();
    const shown = listFFMentorCandidates(); // rendered earlier
    expect(shown).toHaveLength(1);
    expect(
      saveFFChecklistAssessments(
        "C-OK",
        { backgroundCheck: { result: "Failed" } },
        actor,
      ),
    ).toEqual({ ok: true });
    expect(
      createMentorMatchForCandidate(draft(shown[0].mentorId)),
    ).toEqual({ ok: false, reason: "not-candidate" });
    expect(getMentorMatches()).toHaveLength(0);
    expect(listFFMentorCandidates()).toEqual([]);
  });

  it("a current candidate can be matched", () => {
    seed();
    const r = createMentorMatchForCandidate(draft("VOL-C-OK"));
    expect(r.ok).toBe(true);
    expect(getMentorMatches()[0].mentorId).toBe("VOL-C-OK");
  });
});

describe("match sub-program selection (resolved test policy)", () => {
  function seedMulti() {
    const multi = completeApplication("C-MULTI", [
      "community",
      "school",
    ]);
    const other = completeApplication("C-MULTI-2", ["work"]);
    other.app.applicantId = multi.app.applicantId; // same mentor, not qualifying
    const raw = {
      version: 1,
      applications: {
        "C-MULTI": multi.app,
        "C-MULTI-2": other.app,
      },
      staff: {
        "C-MULTI": { ...multi.staff, stage: "Ready for Match" },
        "C-MULTI-2": { ...other.staff, stage: "Interview" },
      },
    };
    localStorage.setItem(
      "mh.ffMentorApplications.v1",
      JSON.stringify(raw),
    );
    localStorage.setItem("mh.ffMentorMatches.v1", "[]");
    __reloadFFMentorApplicationsForTest();
    __reloadMentorMatchesForTest([]);
    return multi.app.applicantId;
  }

  it("several qualifying sub-programs: nothing auto-selected; only qualifying programs offered", () => {
    const mentorId = seedMulti();
    const c = getFFMentorCandidate(mentorId)!;
    expect(c.subProgrammes).toEqual([
      "Community-Based",
      "School-Based",
    ]);
    expect(autoMatchSubProgram(c)).toBeUndefined();
  });

  it("one qualifying sub-program is auto-selected", () => {
    seed();
    expect(
      autoMatchSubProgram(getFFMentorCandidate("VOL-C-OK")),
    ).toBe("Community-Based");
  });

  it("save refuses a sub-program from a non-qualifying application and records the qualifying application", () => {
    const mentorId = seedMulti();
    expect(
      createMentorMatchForCandidate({
        ...draft(mentorId),
        subProgram: "Work-Based",
      }),
    ).toEqual({ ok: false, reason: "sub-program" });
    const r = createMentorMatchForCandidate({
      ...draft(mentorId),
      subProgram: "School-Based",
    });
    expect(r.ok && r.match).toMatchObject({
      subProgram: "School-Based",
      applicationId: "C-MULTI",
    });
  });
});