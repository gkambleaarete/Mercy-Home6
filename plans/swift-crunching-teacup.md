# Plan: Fix `hiddenTabs is not defined` in TreatmentPlanningSupplementalSection

## Context
After a restore to a previous version, `TreatmentPlanningSupplementalSection.tsx` line 45 references `hiddenTabs` — a variable that exists in the parent `TreatmentPlanningView` as a prop — but it was never added to the child component's props interface or passed down from the parent's JSX. This causes a `ReferenceError` at runtime that crashes the entire view.

## Changes Required

### 1. `src/app/components/admissions/TreatmentPlanningSupplementalSection.tsx`
Add `hiddenTabs` to the props interface:
```ts
hiddenTabs: string[];
```
Add it to the destructured function parameters (line 42).

### 2. `src/app/components/admissions/TreatmentPlanningView.tsx`
Pass `hiddenTabs={hiddenTabs}` to `<TreatmentPlanningSupplementalSection>` (~line 3610–3631). The variable is already available in `TreatmentPlanningView`'s own props with default `[]`.

## Verification
Open Admissions → Youth Detail → Treatment Planning tab. The view renders without a `ReferenceError`.

---

# Plan: Fix Edit Button in Med Review Hub Toolbar

## Context
In the Med Review Hub "Review Log Records" toolbar (`MedicationsNavContent.tsx` ~line 582), both the **View** and **Edit** buttons call `setMrhViewOpen(true)`, opening the read-only "Review Log — View" modal. The Edit button should instead open the create/edit modal (`mrhCreateOpen`) pre-populated with the selected record's review type.

## Scope
Only the Edit button's `onClick` inside the selected toolbar div (~line 597 of `MedicationsNavContent.tsx`).

## Change Required

**Edit button onClick** — change from:
```jsx
onClick={() => mrhSelectedId && setMrhViewOpen(true)}
```
To:
```jsx
onClick={() => {
  if (mrhSelectedId && mrhSelectedRecord) {
    setMrhNewType(mrhSelectedRecord.reviewType);
    setMrhCreateOpen(true);
  }
}}
```

`mrhSelectedRecord`, `setMrhNewType`, and `setMrhCreateOpen` are all already destructured from props (lines ~122–183) — no new state or props needed.

## File to Modify
`src/app/components/pages/MedicationsNavContent.tsx` — one targeted `onClick` on the Edit button (~line 597).

## Verification
1. Select a row → click **View** → "Review Log — View" read-only modal opens. ✓
2. Select a row → click **Edit** → create/edit modal opens with Review Type pre-set to the selected record's type. ✓

---

# Plan: Fix Label/Dropdown Stacking in Medications.tsx Filter Bars

## Context
In the Med Review Hub and Med Documentation filter toolbars, the REVIEW TYPE and PROGRAM filter labels appear beside (inline with) their dropdowns instead of above them. The root cause is that the `label` element — despite having `slds-form-label` — may render inline in certain browser/Tailwind resets, and the parent `flex items-end` container doesn't guarantee vertical stacking inside child divs. The fix is to add `flex flex-col` to the wrapper divs so stacking is explicit regardless of label display behaviour.

The user also reported the same issue in **Med Documentation → Preview modal**.

## Scope

Three locations in `src/app/components/pages/Medications.tsx`:

### 1. Selected element — REVIEW TYPE filter (line 1274)
Change `className="space-y-1"` → `className="flex flex-col gap-1"` on the wrapper div. No other change.

### 2. PROGRAM filter (line 1264) — directly above the selected element
Same fix: `className="space-y-1"` → `className="flex flex-col gap-1"`.

> These two fields sit inside the same `flex items-end gap-3 flex-wrap` toolbar.

### 3. Med Documentation Preview modal label/select fields
Find the Preview modal (search for `mdReviewStatus` or "Preview" around line 2314). Apply the same `flex flex-col gap-1` fix to any `space-y-1` or `space-y-1.5` wrapper divs inside it that contain a label + select/input pair.

## Changes Required Outside the Selected Element
Items 2 and 3 are outside the selected element. The user confirmed these should be fixed too ("the same issue is there… also in Med documentation > the Preview modal").

## File to Modify
**`src/app/components/pages/Medications.tsx`** — three targeted className changes, no logic changes.

## Verification
- Open Med Review Hub filter bar → PROGRAM and REVIEW TYPE labels should sit above their dropdowns, not beside them.
- Open Med Documentation → Preview modal → all label/select pairs should stack vertically.

---

# Plan: Fix New Task Modal — Due Date Picker & Dropdown Visibility

## Context
The "New Task" modal in the To Do List (UtilityBar.tsx) has three UX bugs:
1. **Due Date** shows a text input; no calendar/date picker appears
2. **Assigned To** dropdown renders behind the modal backdrop (invisible)
3. **Related To** dropdown renders behind the modal backdrop (invisible)

## Root Causes

### Due Date (Issue 1)
`<DateInput>` uses `type="text"`. Its `onClick` spawns a temporary native `<input type="date">` via JS, which is unreliable. Fix: replace with a direct native `<input type="date">` inside the modal, converting to/from MM/DD/YYYY for state.

### Dropdowns (Issues 2 & 3)
The "New Task" modal backdrop is `z-[60]`. Radix `<SelectContent>` renders via a portal at `z-50` (set in `select.tsx`). Since 50 < 60, the dropdown list appears behind the modal overlay.
Fix: add `style={{ zIndex: 70 }}` to each `<SelectContent>` in the Create Task modal.

## File to Modify
**`src/app/components/layout/UtilityBar.tsx`** — Create Task modal only (around lines 716–742)

## Implementation

### 1. Due Date — replace `<DateInput>` with native `<input type="date">`
```jsx
<input
  type="date"
  value={newDueDate
    ? (() => { const [m,d,y] = newDueDate.split('/'); return `${y}-${m}-${d}`; })()
    : ''}
  onChange={e => {
    if (!e.target.value) { setNewDueDate(''); return; }
    const [y, m, d] = e.target.value.split('-');
    setNewDueDate(`${m}/${d}/${y}`);
  }}
  className="h-9 w-full px-3 rounded slds-text-4 focus:outline-none"
  style={{ border: '1px solid var(--slds-g-color-border-base-1)', backgroundColor: 'var(--slds-g-color-background-base)', color: 'var(--slds-g-color-text-default)' }}
/>
```

### 2. Assigned To — add z-index to SelectContent
```jsx
<SelectContent style={{ zIndex: 70 }}>
  {STAFF_OPTIONS.map(s => <SelectItem key={s} value={s} className="slds-text-4">{s}</SelectItem>)}
</SelectContent>
```

### 3. Related To — add z-index to SelectContent
```jsx
<SelectContent style={{ zIndex: 70 }}>
  <SelectItem value="__none__" className="slds-text-4">None</SelectItem>
  {CONSTITUENT_OPTIONS.map(c => <SelectItem key={c} value={c} className="slds-text-4">{c}</SelectItem>)}
</SelectContent>
```

## Verification
- Open To Do List → "New Task"
- **Due Date**: clicking the field opens the browser's native calendar date picker
- **Assigned To**: dropdown list appears above the modal, not hidden behind it
- **Related To**: same as Assigned To

---

# Plan: Zero-Discrepancy PackMedsView for Admissions Module

## Context

The Pack Meds table (Active/Archive tabs, 8-step Create wizard, View/Edit modals, date-funnel
filters, sortable columns) lives **inline** inside `OtherTabsContentRenderer.tsx` (the Youth /
Program Log module). A `PackMedsView.tsx` component already exists in the Admissions module and is
already wired as `<PackMedsView />` inside `MedicationsSection.tsx` — but it was built at a
different point in time and may have diverged from the source.

The user requires **zero discrepancy**: same table columns, same padding, same status badges, same
8-tab Create dialog with every inner tab (Doses → Set Primary → Packing Prep → Dispense → Count →
Hand Off → Review → Disposal), same View dialog, same Edit (re-opens Create dialog pre-populated),
same date-funnel dropdowns on Start Date and End Date columns.

## Recommended Approach — Direct Extraction (Single Source of Truth)

Rather than manually reconciling two 7,000+ line files, we **replace `PackMedsView.tsx` entirely
by extracting the exact implementation from `OtherTabsContentRenderer.tsx`**. This guarantees
pixel-perfect parity with zero manual reconciliation risk. `MedicationsSection.tsx` needs no
changes — it already renders `<PackMedsView />`.

`OtherTabsContentRenderer.tsx` is **not modified** — it remains the source of truth for the Youth
module.

## What Gets Extracted

Everything scoped to the pack-meds feature in `OtherTabsContentRenderer.tsx`:

### Types (defined locally in OtherTabsContentRenderer, bring into PackMedsView)
- `MedicationPack` interface (id, packName, packStatus, packType, expectedHandoffDate, startDate,
  startTime, endDate, endTime, status, medications, createdBy, createdDate)
- `PackSortCol` type union
- `PackStatus` type union (`"Available" | "Selected" | "Dispensed" | "Received" | "Reviewed"`)
- All inner types needed by the 8 dialog tabs: `SetPrimaryMedRow`, `SetPrimaryPrnRow`,
  `SetPrimaryOtcRow`, `DispenseRow`, `HandOffRow`, `CountRow`, `AdminLogEntry`, `ReviewMedRow`,
  `ReviewLogEntry`, `DisposalMedRow`, `DisposalLogEntry`, `MassDisposalModalRow`,
  `SetPrimaryLogEntry`, `PrnMedication`, `OtcMedication`, `PackPrepLogEntry`, `DispenseLogEntry`,
  `HandOffLogEntry`

### Constants and Helpers (component-level in OtherTabsContentRenderer)
- `DATE_COLS` set
- `parseDateMMDDYYYY(s)`
- `sortPacks(packs, sort)`
- `filterPacks(packs, query)`
- `toggleSort(current, col, setter)`
- `MED_CODES` array and `SET_PRIMARY_CODES` array
- `codeAuditFlag(code)` helper
- `defaultPrnMedications`, `defaultOtcMedications` mock arrays
- `youthDisplayName` constant (use a sensible default or accept as optional prop)

### State (move all into PackMedsView component)
All ~60 `useState` / `useRef` declarations that the pack-meds block depends on (full list in
explore output above), including:
- Sub-tab, sort, filter state
- Both `startDateFunnelRef` and `endDateFunnelRef`
- All 8-step dialog tab state (createPackActiveTab, newPackForm, dateRangeApplied, etc.)
- Set Primary state (setPrimaryMedRows, setPrimaryPrnRows, setPrimaryOtcRowsData, log entries)
- Packing Prep state (packPrepMedSelected, packPrepPrnSelected, packPrepOtcSelected)
- Dispense, Count, Hand Off, Review, Disposal state
- All modal open/close booleans

### Mock Data
- `medicationPacks` initial array (the 4–5 sample records in OtherTabsContentRenderer)

### Functions
- `handleCreatePack()` — validates form, creates/updates pack, resets state
- `handleArchivePack()` — sets pack status to "archived"

### JSX Blocks (verbatim copy)
1. The sub-tab bar (Active / Archive buttons with counts, Clear Filters, Create New Medication Pack
   button)
2. The table (all 9 columns: Pack Name, Status badge, Pack Type, Expected Handoff Date, Start Date
   + funnel, Start Time, End Date + funnel, End Time, Actions)
3. Row-count footer
4. Empty-state row (with Package icon)
5. All date-filter dropdowns (relative / specific, with Apply / Clear footer)
6. The Create New Medication Pack `<Dialog>` with all 8 tabs verbatim
7. The View Pack `<Dialog>`
8. All sub-dialogs: Date Range Change Warning, Set Primary Modal, Modify PRN, Modify All PRN, Add
   OTC, Label Style Modal, Youth Received Modal, Set Review Status Modal, Medication History Modal,
   Mass Disposal Modal, Cancel Confirmation Modal

## File to Modify

| File | Change |
|------|--------|
| `src/app/components/admissions/PackMedsView.tsx` | **Full replacement** — new self-contained component built from the extracted code |

## Files That Require No Changes

| File | Reason |
|------|--------|
| `src/app/components/admissions/MedicationsSection.tsx` | Already renders `<PackMedsView />` with conditional padding |
| `src/app/components/youth/OtherTabsContentRenderer.tsx` | Source of truth — untouched |

## Component Signature

```tsx
// PackMedsView takes no required props; entirely self-contained.
// Optional: accept a youthDisplayName prop for label printing.
export function PackMedsView({ youthDisplayName = "Alex Martinez" }: { youthDisplayName?: string } = {})
```

## Implementation Steps

1. Copy all type definitions from `OtherTabsContentRenderer.tsx` into the top of
   `PackMedsView.tsx`.
2. Copy constants (`DATE_COLS`, `MED_CODES`, `SET_PRIMARY_CODES`, `codeAuditFlag`,
   `defaultPrnMedications`, `defaultOtcMedications`).
3. Copy helper functions (`parseDateMMDDYYYY`, `sortPacks`, `filterPacks`, `toggleSort`) as
   module-level functions (outside the component).
4. Inside the `PackMedsView` function body, declare all `useState` / `useRef` from the dependency
   list, including the `medicationPacks` mock data as initial state.
5. Add `handleCreatePack` and `handleArchivePack` inside the component.
6. Copy the pack-meds render block verbatim (sub-tab bar, table, dialogs) as the component's
   return value, wrapped in a `<div className="space-y-0">` matching the original.
7. Ensure all imports match: lucide-react icons, Radix Dialog, Button, Input, Label, Select,
   Textarea, Checkbox, toast (sonner), cn, DatePickerInput, MedCodePicker, etc.

## Verification

1. Open Admissions → Youth Detail → Health Overview → Medication tab → Pack Meds sub-tab.
2. Confirm: Active/Archive counts render, table columns match exactly (Pack Name, Status, Pack
   Type, Expected Handoff Date, Start Date [with funnel], Start Time, End Date [with funnel], End
   Time, Actions).
3. Click the funnel on Start Date — confirm relative/specific filter dropdown renders correctly.
4. Click "Create New Medication Pack" — confirm all 8 wizard tabs render (Doses, Set Primary,
   Packing Prep, Dispense, Count, Hand Off, Review, Disposal).
5. Click "View" on a row — confirm View dialog shows all fields.
6. Click "Edit" on a row — confirm Create dialog opens pre-populated with pack data.
7. Switch to Archive tab — confirm archived packs appear and Create button is hidden.
8. Compare side-by-side with the Youth module's Pack Meds to confirm zero visual discrepancy.
