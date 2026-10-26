// Browser regression: C-SSRS Full-Lifetime long-option dropdowns in the real
// assessment dialog (popup bounds, width = trigger, wrapping, keyboard/mouse,
// Escape + focus return, save/restore). NOT part of `npm test`.
//
// Run: start the app (`npm run dev`, default http://localhost:5173), then
//   npm i --no-save playwright && npx playwright install chromium
//   SHOTS=/some/dir node browser-checks/cssrs-dropdown-regression.mjs
// Set EXE=/path/to/chromium to use a specific browser binary. Screenshots of
// the open dropdown at desktop / 750px / 380px are written to $SHOTS.
// Browser regression: Full-Lifetime long-option dropdowns in the REAL assessment dialog.
import { chromium } from "playwright";
const b = await chromium.launch({ ...(process.env.EXE ? { executablePath: process.env.EXE } : {}) });
const p = await b.newPage({ viewport: { width: 1400, height: 800 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
const out = []; const check = (n, ok, x = "") => out.push(`${ok ? "PASS" : "FAIL"} ${n} ${x}`);
const X = "cssrs-fl-new";
const dlg = () => p.locator('[role="dialog"]').last();
const active = () => p.evaluate(() => document.activeElement?.id);
const save = () => dlg().getByRole("button", { name: "Save", exact: true }).click();
const opt = (i) => p.getByRole("option").nth(i);

await p.goto("http://localhost:5173/?leadId=L-DEMO-20093"); await p.evaluate(() => localStorage.clear());
await p.goto("http://localhost:5173/?leadId=L-DEMO-20093"); await p.waitForTimeout(1500);
await p.getByText("Testing & Assessments", { exact: true }).first().click();
await p.getByRole("button", { name: /Create New Test/ }).click();
await p.selectOption("#test-type", "C-SSRS Full-Lifetime");
const rad = (k, per, a) => p.locator(`#${X}-ideation-${k}-${per}-${a}`);
const beh = (k, per, a) => p.locator(`#${X}-behavior-${k}-${per}-${a}`);
// Build a form where every long-option dropdown is on screen.
await rad("wishToBeDead", "lifetime", "yes").click();
await rad("nonSpecificActiveThoughts", "lifetime", "no").click();
await rad("wishToBeDead", "past1Month", "no").click();
await rad("nonSpecificActiveThoughts", "past1Month", "no").click();
for (const k of ["nonSuicidalSelfInjury", "interruptedAttempt", "abortedAttempt", "preparatoryActs"]) { await beh(k, "lifetime", "no").click(); await beh(k, "past3Months", "no").click(); }
await beh("actualAttempt", "lifetime", "yes").click();
await p.fill(`#${X}-behavior-actualAttempt-lifetime-count`, "2");
await beh("actualAttempt", "past3Months", "no").click();
for (const g of ["mostRecent", "mostLethal", "initial"]) await p.fill(`#${X}-attempts-${g}-date`, "01/02/2026");

const triggerIds = [
  `${X}-intensity-lifetime-typeNumber`, `${X}-intensity-lifetime-frequency`, `${X}-intensity-lifetime-duration`,
  `${X}-intensity-lifetime-controllability`, `${X}-intensity-lifetime-deterrents`, `${X}-intensity-lifetime-reasonsForIdeation`,
  `${X}-attempts-mostRecent-actual`, `${X}-attempts-mostLethal-actual`, `${X}-attempts-initial-actual`,
];

/** Measure the OPEN listbox (not just the trigger). */
const measure = (trigId) => p.evaluate((id) => {
  const trig = document.getElementById(id).getBoundingClientRect();
  const c = document.querySelector('[data-slot="select-content"]'); const cr = c.getBoundingClientRect();
  const vp = c.querySelector("[data-radix-select-viewport]");
  const options = [...c.querySelectorAll('[role="option"]')];
  const textRects = options.map((o) => { const t = o.querySelector("span:last-child") || o; const r = document.createRange(); r.selectNodeContents(t); return [...r.getClientRects()].map((x) => ({ l: x.left, r: x.right })); });
  const clippedText = textRects.flat().some((x) => x.r > cr.right + 0.5 || x.l < cr.left - 0.5);
  const sel = options.find((o) => o.getAttribute("data-state") === "checked");
  return {
    vw: innerWidth, vh: innerHeight, trig: { l: trig.left, r: trig.right, w: trig.width }, box: { l: cr.left, r: cr.right, t: cr.top, b: cr.bottom, w: cr.width },
    hScroll: vp.scrollWidth > vp.clientWidth + 1 || options.some((o) => o.scrollWidth > o.clientWidth + 1), clippedText,
    heights: options.map((o) => Math.round(o.getBoundingClientRect().height)), n: options.length,
    vScrolls: vp.scrollHeight > vp.clientHeight + 1,
  };
}, trigId);

const widths = [[1400, 800, "desktop"], [750, 800, "750px"], [380, 800, "380px"], [750, 420, "750px short"], [380, 420, "380px short"]];
for (const [w, h, label] of widths) {
  await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(250);
  let bad = [];
  for (const id of triggerIds) {
    const t = p.locator("#" + id);
    // Actual Lethality: make the Potential-free long list the one measured; reveal Potential later.
    await t.scrollIntoViewIfNeeded(); await t.click(); await p.waitForTimeout(250);
    const m = await measure(id);
    const inView = m.box.l >= 0 && m.box.r <= m.vw && m.box.t >= 0 && m.box.b <= m.vh;
    const widthOk = Math.abs(m.box.w - m.trig.w) <= 1 && Math.abs(m.box.l - m.trig.l) <= 1;
    if (!inView || !widthOk || m.hScroll || m.clippedText) bad.push({ id: id.replace(X + "-", ""), inView, widthOk, hScroll: m.hScroll, clippedText: m.clippedText, box: m.box, trig: m.trig });
    await p.keyboard.press("Escape"); await p.waitForTimeout(150);
  }
  check(`${label}: all ${triggerIds.length} long dropdowns — popup within viewport, width = trigger, no horizontal scroll, no clipped text`, bad.length === 0, JSON.stringify(bad));
}

// ── detailed checks on Actual Lethality (last group), per width
for (const [w, h, label] of [[1400, 800, "desktop"], [750, 800, "750px"], [380, 800, "380px"], [380, 420, "380px short"]]) {
  await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(250);
  const id = `${X}-attempts-initial-actual`; const t = p.locator("#" + id);
  await t.scrollIntoViewIfNeeded(); await t.click(); await p.waitForTimeout(250);
  const m = await measure(id);
  check(`${label}: Actual Lethality popup bounds`, m.box.l >= 0 && m.box.r <= m.vw && m.box.t >= 0 && m.box.b <= m.vh && Math.abs(m.box.w - m.trig.w) <= 1, JSON.stringify({ box: m.box, trig: m.trig, vw: m.vw, vh: m.vh }));
  check(`${label}: long options wrap (some option taller than one line) with no h-scroll`, Math.max(...m.heights) > 40 && !m.hScroll && !m.clippedText, JSON.stringify(m.heights));
  if (label === "380px short") check(`${label}: menu has its own vertical scroll when height is short`, m.vScrolls);
  if (label === "desktop") await p.screenshot({ path: (process.env.SHOTS ?? ".") + "/dd-after-desktop.png" });
  if (label === "750px") await p.screenshot({ path: (process.env.SHOTS ?? ".") + "/dd-after-750.png" });
  if (label === "380px") await p.screenshot({ path: (process.env.SHOTS ?? ".") + "/dd-after-380.png" });
  // Escape → closes, value unchanged, focus returns to the trigger
  const before = await t.innerText();
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  check(`${label}: Escape closes, value unchanged, focus back on trigger`, (await p.getByRole("listbox").count()) === 0 && (await t.innerText()) === before && (await active()) === id, await active());
  // keyboard: open (Enter), End → last option, Enter selects it
  await t.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  await p.keyboard.press("End"); await p.waitForTimeout(150);
  const lastVisible = await p.evaluate(() => { const o = [...document.querySelectorAll('[role="option"]')].pop(); const vp = document.querySelector("[data-radix-select-viewport]").getBoundingClientRect(); const r = o.getBoundingClientRect(); return r.top >= vp.top - 1 && r.bottom <= vp.bottom + 1; });
  await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  check(`${label}: keyboard End+Enter selects the final option (scrolled into view); focus on trigger`, lastVisible && (await t.innerText()).startsWith("5 – Death.") && (await active()) === id, (await t.innerText()).slice(0, 30));
  // mouse: open, scroll final option into view, click it
  await t.click(); await p.waitForTimeout(200);
  await opt(0).scrollIntoViewIfNeeded(); await opt(0).click(); await p.waitForTimeout(200);
  check(`${label}: mouse selects option 0; its full description is shown wrapped in the field`, (await t.innerText()).startsWith("0 – No physical damage or very minor physical damage.") && (await t.evaluate((e) => e.getBoundingClientRect().height)) >= 36, (await t.innerText()).slice(0, 30));
  await t.click(); await p.waitForTimeout(200);
  await opt(5).scrollIntoViewIfNeeded(); await opt(5).click(); await p.waitForTimeout(200);
  check(`${label}: mouse selects the final option after scrolling to it`, (await t.innerText()).startsWith("5 – Death."));
  await t.click(); await p.waitForTimeout(150); await opt(0).click(); await p.waitForTimeout(150); // back to 0 for the next width
}

// ── Actual 0 reveals Potential; Potential 0 selectable; groups independent; saves; restores
await p.setViewportSize({ width: 1400, height: 800 }); await p.waitForTimeout(250);
const pick = async (id, i) => { await p.locator("#" + id).scrollIntoViewIfNeeded(); await p.locator("#" + id).click(); await p.waitForTimeout(150); await opt(i).click(); await p.waitForTimeout(150); };
await pick(`${X}-attempts-mostRecent-actual`, 2); // moderate
await pick(`${X}-attempts-mostLethal-actual`, 5); // death
await pick(`${X}-attempts-initial-actual`, 0);
check("Actual 0 (initial) shows Potential; 2 and 5 do not", (await p.locator(`#${X}-attempts-initial-potential`).count()) === 1 && (await p.locator(`#${X}-attempts-mostRecent-potential`).count()) === 0 && (await p.locator(`#${X}-attempts-mostLethal-potential`).count()) === 0);
const pot = p.locator(`#${X}-attempts-initial-potential`);
await pot.scrollIntoViewIfNeeded(); await pot.click(); await p.waitForTimeout(200);
const mp = await measure(`${X}-attempts-initial-potential`);
check("Potential Lethality popup also within bounds and width = trigger", mp.box.l >= 0 && mp.box.r <= mp.vw && Math.abs(mp.box.w - mp.trig.w) <= 1 && !mp.hScroll && !mp.clippedText && mp.n === 3);
await opt(0).click(); await p.waitForTimeout(200);
check("Potential Lethality 0 is selectable and shows its full text", (await pot.innerText()).startsWith("0 – Behavior not likely to result in injury."));
await pick(`${X}-intensity-lifetime-typeNumber`, 0);
for (const k of ["frequency", "duration", "controllability", "deterrents", "reasonsForIdeation"]) await pick(`${X}-intensity-lifetime-${k}`, 0);
await save(); await p.waitForTimeout(500);
const rec = await p.evaluate(() => JSON.parse(localStorage.getItem("mh.cssrsAssessments.v1")).records[0]);
check("saved lethality codes are independent per group (2 / 5 / 0) and Potential 0 saved", rec.responses.attempts.mostRecent.actualLethality === 2 && rec.responses.attempts.mostLethal.actualLethality === 5 && rec.responses.attempts.initial.actualLethality === 0 && rec.responses.attempts.initial.potentialLethality === 0 && rec.responses.attempts.mostRecent.potentialLethality === null && rec.responses.attempts.mostLethal.potentialLethality === null, JSON.stringify(rec.responses.attempts));
// restore on edit
await p.locator("tbody tr", { hasText: "C-SSRS Full-Lifetime" }).getByTitle("Edit").click(); await p.waitForTimeout(400);
const P2 = await p.evaluate(() => document.querySelector('[id^="cssrs-fl-CSSRS-"]').id.split("-ideation")[0].split("-behavior")[0].split("-intensity")[0].split("-attempts")[0]);
const txt = (g, f) => p.locator(`#${P2}-attempts-${g}-${f}`).innerText();
check("edit restores each group's saved selections", (await txt("mostRecent", "actual")).startsWith("2 – Moderate physical damage requiring medical attention") && (await txt("mostLethal", "actual")).startsWith("5 – Death.") && (await txt("initial", "actual")).startsWith("0 – No physical damage") && (await txt("initial", "potential")).startsWith("0 – Behavior not likely to result in injury."));
// changing one group leaves the others alone
await p.locator(`#${P2}-attempts-mostRecent-actual`).scrollIntoViewIfNeeded(); await p.locator(`#${P2}-attempts-mostRecent-actual`).click(); await opt(0).click(); await p.waitForTimeout(200);
check("changing most-recent to 0 leaves the other groups unchanged", (await txt("mostLethal", "actual")).startsWith("5 – Death.") && (await txt("initial", "potential")).startsWith("0 – Behavior not likely") && (await p.locator(`#${P2}-attempts-mostRecent-potential`).count()) === 1);
await dlg().getByRole("button", { name: "Cancel", exact: true }).click();
await p.getByRole("button", { name: /Create New Test/ }).click();
check("Test selector is still a native select", (await p.locator("select#test-type").count()) === 1);
check("page errors none", errs.length === 0, JSON.stringify(errs));
console.log(out.join("\n")); await b.close();
