/**
 * Boundary-conversion helpers used when swapping a native `<input type="date">`
 * (which the HTML spec requires to store its value as ISO "YYYY-MM-DD") for the
 * shared `<DateInput>` component (which always displays/edits "MM/DD/YYYY").
 *
 * These only convert at the UI boundary — they intentionally do NOT change how
 * a screen stores or compares dates internally, so any existing sort/validation
 * logic elsewhere in a file keeps working exactly as before.
 */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MDY_RE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** "YYYY-MM-DD" -> "MM/DD/YYYY". Passes through unchanged if not valid ISO. */
export function isoToMdy(iso?: string | null): string {
  if (!iso) return "";
  const m = ISO_RE.exec(iso);
  if (!m) return iso; // already MM/DD/YYYY or empty/partial — leave as-is
  const [, y, mo, d] = m;
  return `${mo}/${d}/${y}`;
}

/** "MM/DD/YYYY" -> "YYYY-MM-DD". Passes through unchanged if not valid MM/DD/YYYY. */
export function mdyToIso(mdy?: string | null): string {
  if (!mdy) return "";
  const m = MDY_RE.exec(mdy);
  if (!m) return mdy; // incomplete while typing, or already ISO — leave as-is
  const [, mo, d, y] = m;
  return `${y}-${mo}-${d}`;
}

const HM24_RE = /^(\d{2}):(\d{2})$/;
const HM12_RE = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

/** "HH:MM" (24h, a native time input's value) -> "h:mm AM/PM". Passes
 *  through unchanged if not valid HH:MM. */
export function time24To12(hm?: string | null): string {
  if (!hm) return "";
  const m = HM24_RE.exec(hm);
  if (!m) return hm;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

/** "h:mm AM/PM" -> "HH:MM" (24h). Passes through unchanged if not valid. */
export function time12To24(t?: string | null): string {
  if (!t) return "";
  const m = HM12_RE.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${m[2]}`;
}

/**
 * Formats any date-like value as "MM/DD/YYYY", guaranteed independent of the
 * viewer's OS/browser locale — used to replace `.toLocaleDateString(...)` calls,
 * which (even with an explicit locale argument) still depend on the browser's
 * Intl implementation. This does plain manual formatting instead, so there is
 * zero locale dependency at all. Returns "" for invalid/empty input.
 */
export function formatMdy(
  date?: Date | string | number | null,
): string {
  if (date === null || date === undefined || date === "")
    return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}