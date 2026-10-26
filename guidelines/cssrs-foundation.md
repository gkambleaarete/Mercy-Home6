# C-SSRS foundation (US 20105 Screener, US 20139 Full-Lifetime) — Chunk 1

Shared foundation only. Neither questionnaire is exposed in the UI yet.

## Files
- `src/app/data/cssrsTypes.ts` — response types, fresh empty-state factories, validators.
- `src/app/data/cssrsAssessmentStore.ts` — the one saved source for C-SSRS records.
- `src/app/lib/cssrsOwnership.ts` — ownership from the viewed profile.
- `src/app/components/admissions/CssrsControls.tsx` — Yes/No group, help text, description field, read-only response.

## Ownership
Each record keeps `admissionsRecordId` (the Admissions record, never a Constituent id),
`youthKey` (existing `testingYouthKey`, so visibility stays youth-based) and
`youthConstituentId` (verified via `resolveProfileYouth`, else `null`).
`resolveCssrsOwnership` returns `admissionsRecordId: null` on a Constituent profile, and
the store refuses a record without one.

## Persistence — PROTOTYPE ONLY
Browser `localStorage` key `mh.cssrsAssessments.v1`, schema version 1, all-or-nothing
writes (same convention as `medReviewStore`). This is prototype persistence, not
production storage. Corrupt or unsupported-version data is left untouched in storage,
reported as `status: "error"`, and refused for writes; `getUnreadableCssrsData()` returns the
raw text for recovery. IDs are `CSSRS-000001`-style strings, so they cannot collide with the
existing numeric Testing ids. The existing Testing list store and documents are unchanged;
`cssrsAsTestRows` adapts this store's records into list rows without keeping a copy.

## Pending (later chunks)
- Chunk 2: Screener form and the Related IR selector (`relatedIncidentReportId`).
- Full Lifetime form, list integration through `cssrsAsTestRows`, and DLG-01 dialog integration.
- Chunk 5: the Full Lifetime mandatory trigger. Risk Factors (`RiskFactorsSection`) keeps its own
  local sample state; it must first be backed by a real saved source before any rule reads it.
  No rule is connected to that sample state here.
- No overall risk level is calculated anywhere.

## Chunk 2 — C-SSRS Screener (US 20105)
- Selectable as "C-SSRS Screener" in the existing Standardized Test dialog (DLG-01); saved records are listed with the legacy tests via `cssrsAsTestRows`. Nothing is copied: the saved source is `cssrsAssessmentStore`, the component keeps only the editing draft.
- Rules (wording, conditional flow, validation, per-answer classification): `src/app/data/cssrsScreener.ts`. Save path: `cssrsScreenerSave.ts`. Hidden answers are normalized away in the store too. There is no overall risk calculation.
- IDs: C-SSRS ids are strings; legacy tests are numeric. `selectedTestId` / `hoveredTestId` accept both, C-SSRS edits go to its own store, and legacy id generation only reads legacy records. Delete is not exposed for C-SSRS rows.
- Related IR: `lib/cssrsRelatedIr.ts`. Offered only for a verified Youth Constituent and reports whose explicit `incidentTypes` include Suicide Attempt, Suicidal Ideation or Self-Harm. `IncidentReportRecord.incidentTypes` is new and optional; no existing record has it, and the IR create form does not yet save to the shared records, so today no report is eligible and the selector shows an explanatory empty state. Admissions' own incident list is a separate local source and is not joined.

## Running the tests
`npm install` then `npm test` (vitest + jsdom, dev dependencies). Browser persistence in these tests is jsdom `localStorage`.

## Chunk 3 — Full-Lifetime Sections 1–2 (US 20139)
Not selectable yet: "C-SSRS Full-Lifetime" is not in the Test selector, and nothing saves a partial Full Lifetime assessment.
- Rules/content: `src/app/data/cssrsFullLifetime.ts` (visibility per period, normalization, `validateIdeationIntensity`). Components: `components/admissions/CssrsFullLifetimeSections.tsx` (`FullLifetimeIdeationSection`, `FullLifetimeIntensitySection`, read-only `FullLifetimeIdeationIntensityDetails`, `fullLifetimeFocusId`).
- Payload: each ideation question now has `lifetimeDescription` / `past1MonthDescription`, and `mostSevereIdeation.{lifetime,recent}` holds the Type Number and description. Payload version stays 1 because no Full Lifetime record could have been saved before this change.
- The store normalizes Sections 1–2 on create/update (hidden answers, descriptions and ratings never persist); Behavior, Lethality and attempts are never touched.
- Assumption: "If Yes, Describe" and "Description of Ideation" are optional (the ticket does not make them mandatory). Type Number and the five ratings are required for each applicable intensity period; Type Number must equal the highest-numbered Yes in that period and is never auto-selected.
- Ratings use the project `Select` with the new `valueOverflow="wrap"` variant so the full selected text shows. No risk badge, total or sum exists for Full Lifetime.
- Chunk 4 must add: Behavior and Lethality, the Full Lifetime selector entry, the dialog form (validation with `validateIdeationIntensity`, focus via `fullLifetimeFocusId`), create/save/view/edit through the existing store, the list row, and the mandatory trigger.

## Chunk 4 — Full-Lifetime Behavior, Lethality and the complete flow (US 20139)
- Selectable as "C-SSRS Full-Lifetime" in the Standardized Test dialog; create/save/view/edit use the same store, list adapter and view dialog as the Screener. Save service: `cssrsFullLifetimeSave.ts`; composed rules: `cssrsFullLifetimeRules.ts` (`normalizeFullLifetime`, `validateFullLifetime`), applied again at the store mutation boundary, so an incomplete or inconsistent payload cannot be saved by bypassing the form. Behavior/Attempt rules: `cssrsFullLifetimeBehavior.ts`; components: `CssrsFullLifetimeBehaviorSections.tsx`, `CssrsFullLifetimeFields.tsx`.
- Payload (version 1; no Full Lifetime record could have been saved earlier): each behavior category has per-period answer, description and count. Actual Attempt is ONE staff decision per period; the interview prompts are on-screen guidance with no response fields.
- Count assumptions: Yes needs a positive whole number; No saves 0 and clears the description; unanswered stays null; negative, fractional or non-numeric entries are rejected (the form keeps the typed text and shows the error). Non-suicidal self-injury is Yes/No only and never triggers Section 4. Narratives are optional.
- Section 4 applies only when Actual Attempt = Yes in either period; date and Actual Lethality are required in all three groups (prototype completion rule); Potential Lethality only when that group's Actual Lethality is 0. `AttemptDetails.description` (from Chunk 1) is unused and always "".
- Still pending (Chunk 5): the mandatory Full Lifetime trigger. No risk calculation exists.

## Versioning policy (Full Lifetime records can now exist)
Full-Lifetime assessments are now saved in browsers, so payload version 1 (the current shape: per-period descriptions/counts, `mostSevereIdeation`) must be treated as having saved records. Any further incompatible change to `FullLifetimeResponses` or `ScreenerResponses` must bump `CSSRS_PAYLOAD_VERSION` and add a read-time migration in `cssrsAssessmentStore.ts`. Until then, a record with an unsupported payload version is not loaded: the store reports an error, refuses writes and leaves the saved text untouched (covered by `cssrsFullLifetimeSaveBoundary.test.ts`).

## Dialog sizing
The Standardized Test dialog (DLG-01) already uses `sm:max-w-4xl`, the same width as the shared `size="xl"` dialog variant. It was left on its existing shell, because `size="xl"` also changes padding and title styling for every legacy test.

## Long-option dropdowns
`SelectContent` has an opt-in `wrapOptions` prop (shared `ui/select.tsx`): the popup is exactly as wide as its trigger, stays inside the viewport with a collision margin (flipping above the field when needed), is height-limited with its own vertical scroll, and options wrap. Default Select consumers are unchanged. The Full-Lifetime rating, lethality and type-number dropdowns use it with `SelectTrigger valueOverflow="wrap"`. Regression: `browser-checks/cssrs-dropdown-regression.mjs`.

## Chunk 5A — persisted Risk Factors and requirement visibility (US 20139)
This increment connects saved Admissions Risk Factors to a visible Full-Lifetime requirement. **US 20139 is not complete**: mandatory enforcement and the completion policy are unresolved (below).

- **Source:** `src/app/data/riskFactorStore.ts` is the one saved source for Risk Factors (no earlier store existed; `RiskFactorsSection` previously held universal sample rows in component state). Browser `localStorage` key `mh.admissionsRiskFactors.v1`, schema version 1, all-or-nothing writes, corrupt/unsupported data left untouched and writes refused (`getUnreadableRiskFactorData()`). PROTOTYPE persistence only. The old sample rows were not migrated; with no saved records the normal empty state shows.
- **Ownership:** each record keeps `admissionsRecordId` and `youthKey`, passed explicitly from `resolveCssrsOwnership`. Reads filter by Admissions record, so switching records never exposes another's Risk Factors; edit/delete require the owning record. With no Admissions record (a Constituent profile) the screen shows an explanation and reads/writes nothing; no default youth is ever used. `RiskFactorsSection` now takes an `owner` prop; `ClinicalAssessmentsView` passes it through.
- **Rule:** `src/app/lib/cssrsRequirement.ts`. A saved Risk Factor of exactly "Suicidal Ideation" or "Self-Harm" (legacy exact alias "Self Harm") means Full-Lifetime is required. No substring or narrative matching. Result is one of `required` (with the matching factors), `none`, or `unavailable` (unreadable data or no Admissions record), which is never shown as "not needed". Recomputed from the store, so Add/Edit/Delete, refresh and record switching update it.
- **UI:** `CssrsRequirementNotice.tsx` (shared `Alert`) appears under Risk & Legal > Risk Factors and at the top of Testing & Assessments, naming the matching factor(s). "Complete C-SSRS Full-Lifetime" opens the existing Add Standardized Test dialog with Full-Lifetime selected (same form, validation, save service and store; nothing is saved until Save, and an open draft is never replaced). When the record is not Active/Referral the action is replaced by the existing restriction text. The Testing panel also lists Full-Lifetime assessments owned by the current Admissions record with View/Edit; assessments owned by another record are not shown there. The general Testing list keeps its youth-based visibility. Version 1 Full-Lifetime records stay readable and keep the version 2 edit-upgrade.
- **Not implemented (unresolved policy):** no "requirement satisfied" calculation; nothing is blocked and no status changes; no aggregate risk.

### Decisions still needed
1. Is past-year suicidal thoughts/attempts an additional trigger, or a condition on the Risk Factor trigger? (Not inferred from `lastOccurred`, descriptions or Screener answers; no AND/OR assumed.)
2. What is the authoritative source of that history?
3. Which Admissions action must be blocked, and when?
4. Which saved assessment satisfies the requirement, how old may it be, and when is reassessment needed after a new Risk Factor?
