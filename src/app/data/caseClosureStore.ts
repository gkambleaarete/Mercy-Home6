import { useSyncExternalStore } from "react";
import { SEED_WAITLIST } from "./mockProjectionsWaitlistData";
import { sendInAppNotification } from "../lib/academicSnapshotTask";

// Admissions case closure lifecycle (US 17573 revisions, 10/14/2026) — the
// single source both Projections & Waitlist and the Admissions Pipeline
// read, keyed by the Admissions case id (lead id, e.g. "L-016"):
//
//   1. closing    — the case entered closure. It leaves active Projections
//                   and the running Admissions Pipeline immediately and is
//                   shown on the dedicated Closing List.
//   2. eligible   — derived, not stored: 30+ days after closingStartedAt.
//                   One durable in-app notification is recorded per closure
//                   cycle. Eligibility is NOT archival or deletion.
//   3. finalized  — staff explicitly completed the closure. The case shows
//                   in the Admissions "Closed" category only.
//
// Persisted to this browser's localStorage (same convention as
// communityNeedsStore) so the timer and notifications survive reloads.
// Prototype only: a browser cannot process eligibility while the app is
// closed. Production needs a scheduled job + real notification delivery;
// sendInAppNotification below is the existing not-configured stub.

export const CLOSING_LIST_DAYS = 30;

export interface CaseClosure {
  caseId: string;
  name: string;
  /** When the case entered closure (ISO timestamp, or "YYYY-MM-DD" for
   *  seed/legacy records). Never reset by unrelated saves. */
  closingStartedAt: string;
  state: "closing" | "finalized";
  finalizedAt?: string;
  finalizedBy?: string;
  /** "seed" = mapped from prototype seed data on first load. */
  origin: "seed" | "user";
}

export interface ClosureNotification {
  /** `${caseId}|${closingStartedAt}` — one per closure cycle. */
  id: string;
  caseId: string;
  name: string;
  createdAt: string;
  message: string;
  read: boolean;
}

export type ClosureStatus =
  "closing" | "eligible" | "finalized";

interface ClosureData {
  closures: Record<string, CaseClosure>;
  notifications: ClosureNotification[];
}

// ─── Pure helpers (clock injected) ──────────────────────────────────────────

function localDate(stamp: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(stamp)) {
    const [y, m, d] = stamp.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const t = new Date(stamp);
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

/** Whole calendar days the case has been in closure as of `now`. */
export function daysInClosing(
  c: Pick<CaseClosure, "closingStartedAt">,
  now: Date,
): number {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  return Math.max(
    0,
    Math.round(
      (today.getTime() -
        localDate(c.closingStartedAt).getTime()) /
        86_400_000,
    ),
  );
}

export function getClosureStatus(
  c: CaseClosure,
  now: Date,
): ClosureStatus {
  if (c.state === "finalized") return "finalized";
  return daysInClosing(c, now) >= CLOSING_LIST_DAYS
    ? "eligible"
    : "closing";
}

export function notificationId(c: CaseClosure): string {
  return `${c.caseId}|${c.closingStartedAt}`;
}

// ─── Seed mapping ───────────────────────────────────────────────────────────
// Existing Closed seed records keep their original closure dates:
//  - with a Closing List date (closedAt) → still pending closure
//    (closing / eligible by its age), as they were on the old Closing List;
//  - without one → treated as already-finalized legacy Closed records.

function seedData(): ClosureData {
  const closures: Record<string, CaseClosure> = {};
  for (const c of SEED_WAITLIST) {
    if (c.category !== "Closed") continue;
    closures[c.id] = c.closedAt
      ? {
          caseId: c.id,
          name: c.name,
          closingStartedAt: c.closedAt,
          state: "closing",
          origin: "seed",
        }
      : {
          caseId: c.id,
          name: c.name,
          closingStartedAt: c.categoryEnteredAt,
          state: "finalized",
          finalizedAt: c.categoryEnteredAt,
          finalizedBy: "Legacy record",
          origin: "seed",
        };
  }
  return { closures, notifications: [] };
}

// ─── Store ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "mh.admissions.caseClosures.v1";

function load(): ClosureData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ClosureData;
      if (parsed && parsed.closures && parsed.notifications)
        return parsed;
    }
  } catch {
    // No storage (private window, tests) — fall back to seed.
  }
  return seedData();
}

let data: ClosureData = load();
const listeners = new Set<() => void>();

function commit(next: ClosureData) {
  data = next;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next),
    );
  } catch {
    // Storage unavailable: state still updates for this session.
  }
  listeners.forEach((l) => l());
}

export function subscribeCaseClosures(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCaseClosureData(): ClosureData {
  return data;
}

export function useCaseClosures(): ClosureData {
  return useSyncExternalStore(
    subscribeCaseClosures,
    getCaseClosureData,
    getCaseClosureData,
  );
}

/** Starts closure. Idempotent: a case already closing or finalized keeps
 *  its original timestamp (re-saving Closed never resets the timer). */
export function startCaseClosure(
  caseId: string,
  name: string,
  now: Date,
): void {
  if (data.closures[caseId]) return;
  commit({
    ...data,
    closures: {
      ...data.closures,
      [caseId]: {
        caseId,
        name,
        closingStartedAt: now.toISOString(),
        state: "closing",
        origin: "user",
      },
    },
  });
}

/** The case was moved out of Closed before finalization. Its notification
 *  history is kept; a later closure starts a new cycle. */
export function reopenCaseClosure(caseId: string): void {
  const c = data.closures[caseId];
  if (!c || c.state === "finalized") return;
  const { [caseId]: _removed, ...rest } = data.closures;
  commit({ ...data, closures: rest });
}

/** Explicit staff action: persists Closed. Allowed at any point of the
 *  Closing List (eligibility is a prompt, not a precondition). */
export function finalizeCaseClosure(
  caseId: string,
  by: string,
  now: Date,
): void {
  const c = data.closures[caseId];
  if (!c || c.state === "finalized") return;
  commit({
    ...data,
    closures: {
      ...data.closures,
      [caseId]: {
        ...c,
        state: "finalized",
        finalizedAt: now.toISOString(),
        finalizedBy: by,
      },
    },
  });
}

export function markClosureNotificationsRead(): void {
  if (data.notifications.every((n) => n.read)) return;
  commit({
    ...data,
    notifications: data.notifications.map((n) => ({
      ...n,
      read: true,
    })),
  });
}

/** Records one notification per closure cycle that has reached 30 days.
 *  Safe to call on every load / day rollover / focus: already-notified
 *  cycles are skipped. Returns the newly created notifications. */
export function processClosureEligibility(
  now: Date,
): ClosureNotification[] {
  const known = new Set(data.notifications.map((n) => n.id));
  const created: ClosureNotification[] = Object.values(
    data.closures,
  )
    .filter(
      (c) =>
        getClosureStatus(c, now) === "eligible" &&
        !known.has(notificationId(c)),
    )
    .map((c) => ({
      id: notificationId(c),
      caseId: c.caseId,
      name: c.name,
      createdAt: now.toISOString(),
      message: `${c.name} has been on the Closing List for at least ${CLOSING_LIST_DAYS} days and is Eligible for Archive. Complete the closure when follow-up is done.`,
      read: false,
    }));
  if (created.length === 0) return created;
  commit({
    ...data,
    notifications: [...created, ...data.notifications],
  });
  // Integration point: no notification service exists yet (stub returns
  // "not_configured"). The record above is the durable in-app copy.
  created.forEach(
    (n) =>
      void sendInAppNotification({
        channel: "in-app",
        recipient: {
          id: "admissions-team",
          name: "Admissions Team",
          email: "",
        },
        content: {
          title: "Case Eligible for Archive",
          subject: "Case Eligible for Archive",
          youthName: n.name,
          details: [{ label: "Status", value: n.message }],
          ctaLabel: "Open Closing List",
        },
        link: "/projections-waitlist",
      }),
  );
  return created;
}

/** Test-only reset. */
export function __resetCaseClosuresForTest(
  next: ClosureData = seedData(),
): void {
  commit(next);
}