# Plan: Add ROI Tracking to Case Details → Case Information Tab

## Context

The ROI Tracking spec calls for a new section directly below "Documentation Releases Sent" inside the **Case Details → Case Information** sub-tab. That section lives in `LeadDetailCaseDetailsTab.tsx`. However, the previous implementation added ROI Tracking as a new sub-tab inside the **Overview** card in `LeadDetailView.tsx`. The static analysis confirms:

- `LeadDetailView.tsx`: ROI Tracking tab button + `<ROITrackingSection />` correctly wired — **visible only if the user is on the Overview tab and clicks "ROI Tracking"**.
- `LeadDetailCaseDetailsTab.tsx`: ROI Tracking section is **completely absent** — nothing exists below Documentation Releases Sent. This is why the user cannot see the changes when navigating to Case Details → Case Information.

The self-contained `ROITrackingSection` component (`src/app/components/admissions/ROITrackingSection.tsx`) already exists and is production-ready — it manages its own state and dialog internally with no props required.

## What Needs to Change

### File: `src/app/components/admissions/LeadDetailCaseDetailsTab.tsx`

1. **Add import** at the top of the file:
   ```tsx
   import { ROITrackingSection } from "./ROITrackingSection";
   ```

2. **Find the Documentation Releases Sent card** — it ends around line 1150-1160 with its closing `</div>` (the outer card wrapper). Immediately after that closing tag, add:
   ```tsx
   {/* ROI Tracking Section */}
   <ROITrackingSection />
   ```

   This places ROI Tracking directly below Documentation Releases Sent inside the `{caseSubTab === "caseInfo" && ...}` content block, matching the spec exactly.

No changes to the existing Documentation Releases Sent section — it stays completely intact.

### File: `src/app/components/admissions/LeadDetailView.tsx`

No changes needed. The Overview sub-tab implementation remains in place (harmless bonus entry point).

## Critical Files

| File | Change |
|---|---|
| `LeadDetailCaseDetailsTab.tsx` | Add import + `<ROITrackingSection />` after Documentation Releases Sent card |
| `ROITrackingSection.tsx` | No changes — reuse as-is |
| `LeadDetailView.tsx` | No changes |

## Reusable Component

`src/app/components/admissions/ROITrackingSection.tsx` — named export `ROITrackingSection`, fully self-contained, zero props required.

## Verification

1. Navigate to a Youth lead → **Case Details tab** → **Case Information** sub-tab.
2. Scroll past "Documentation Releases Sent" — the ROI Tracking section should appear immediately below it with the header "Release of Information (ROI) Tracking."
3. Confirm the 4 mock records table renders (Completed / Sent / Signed / Partially Received).
4. Click "+ New ROI" → modal opens with all fields (Organization, ROI Type, 4 date pickers, Status, Follow Up Notes, Linked Document placeholder).
5. Save a new record → row appears in table, toast confirms success.
6. Edit and delete existing rows → both work.
7. Search and filter controls narrow the table correctly.

---

# Previous Plan: Add Missing Input States to Form Controls (FRM-01, FRM-02, FRM-03)

## Context

The Form Controls section (`div#sec-form-controls` in `ComponentsTabContent.tsx`) currently shows only a partial set of input states. The user wants every realistic state — disabled, read-only, focus — covered and visually demonstrated, each with its own `CopyCSSBtn`. All changes are scoped to the selected element only.

---

## What's Currently There vs. What's Missing

### FRM-01 — Text Inputs
| State | Currently? |
|---|---|
| Label (normal + required) | ✅ |
| Default (filled value) | ✅ |
| Placeholder | ✅ |
| Error | ✅ |
| **Read-Only** | ❌ |
| **Disabled** | ❌ |
| **Focus** (static visual) | ❌ |

### FRM-02 — Select, Checkbox & Toggle
| State | Currently? |
|---|---|
| Select — default | ✅ |
| Select — **disabled** | ❌ |
| Checkbox — Checked | ✅ |
| Checkbox — Unchecked | ✅ |
| Checkbox — **Disabled variants** | ❌ |
| Toggle — On | ✅ |
| Toggle — Off | ✅ |
| Toggle — **Disabled** | ❌ |

### FRM-03 — Text Area
| State | Currently? |
|---|---|
| Default (with value) | ✅ |
| Placeholder | ✅ |
| Error | ✅ |
| **Read-Only** | ❌ |
| **Disabled** | ❌ |

---

## SLDS Token Reference (from codebase exploration)

These patterns are established across the real app:

| State | `backgroundColor` token | `cursor` | Files using this |
|---|---|---|---|
| **Disabled** | `var(--slds-g-color-neutral-95)` | `not-allowed` | UtilityBar, LegalInvolvementDialog, DCFSInvolvementDialog, LeadDetailHealthDialogs |
| **Read-Only / View Mode** | `var(--slds-g-color-background-alt)` | `not-allowed` | MedicationsView, ContactLog, LeadDetailPSOTab, ContactLogDialogSLDS |
| **Focus** (static) | same as default | text | Show via `boxShadow` + `borderColor` |

**Token hex values** (must be resolved before writing `CopyCSSBtn` CSS strings — project rule: no `var()` in copy CSS):
```bash
grep -n "neutral-95\|background-alt" /workspaces/default/code/src/styles/globals.css
```
Expected: `--slds-g-color-neutral-95` ≈ `#f3f2f2`, `--slds-g-color-background-alt` ≈ `#fafaf9`

---

## File to Modify

`src/app/components/pages/ComponentsTabContent.tsx` — only within `div#sec-form-controls`.

---

## Implementation

### FRM-01 — Add 3 new rows after the existing Error row

**Read-Only input**
- Label: "Organization" with `(read-only)` note
- `readOnly` attribute on `<input>`
- `style={{ backgroundColor: "var(--slds-g-color-background-alt)", cursor: "not-allowed", border: "1px solid var(--slds-g-color-border-base-1)", ... }}`
- `CopyCSSBtn css`: `.form-input--readonly { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; }`

**Disabled input**
- Label: "Assigned Worker" (label styled same — SLDS doesn't visually change the label for disabled, only the field)
- `disabled` attribute on `<input>`
- `style={{ backgroundColor: "var(--slds-g-color-neutral-95)", cursor: "not-allowed", border: "1px solid var(--slds-g-color-border-base-1)", ... }}`
- `CopyCSSBtn css`: `.form-input--disabled { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #f3f2f2; cursor: not-allowed; }`

**Focus input (static visual)**
- Label: "Search" with `(focus state)` note
- Regular `<input>` with value, inline styles to simulate focus: `borderColor: "#145F33"`, `boxShadow: "0 0 0 3px rgba(20,95,51,0.2)"`, `outline: "none"`
- `CopyCSSBtn css`: `.form-input:focus { border-color: #145F33; box-shadow: 0 0 0 3px rgba(20,95,51,0.2); outline: none; }`

Also update the `ShowcaseCard cssCode` prop on FRM-01 to include the new modifier classes.

---

### FRM-02 — Add disabled variants

**Select — Disabled** (new row below the existing select)
- `<select disabled>` with `backgroundColor: "var(--slds-g-color-neutral-95)"`, `cursor: "not-allowed"`, `opacity: 0.6`
- `CopyCSSBtn css`: `.form-select--disabled { appearance: none; width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #f3f2f2; cursor: not-allowed; opacity: 0.6; }`

**Checkbox — Disabled variants** (new flex row after the existing checked/unchecked row)
- Disabled Checked: same green box, `opacity: 0.5`, `cursor: not-allowed` on parent label
- Disabled Unchecked: same border-only box, `opacity: 0.5`, `cursor: not-allowed` on parent label
- `CopyCSSBtn css`: `.checkbox--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }`

**Toggle — Disabled variants** (new flex row after the existing On/Off row)
- Disabled On: green track + white thumb, `opacity: 0.5`, `cursor: not-allowed`
- Disabled Off: gray track + white thumb, `opacity: 0.5`, `cursor: not-allowed`
- `CopyCSSBtn css`: `.toggle--disabled { opacity: 0.5; cursor: not-allowed; pointer-events: none; }`

Also update `ShowcaseCard cssCode` on FRM-02 to include disabled modifier classes.

---

### FRM-03 — Add 2 new textarea columns

The existing 3-col grid becomes a 5-item grid (wraps naturally at md:grid-cols-3):

**Read-Only textarea**
- Label: "Background Notes" with `(read-only)` note
- `readOnly` + `style={{ backgroundColor: "var(--slds-g-color-background-alt)", cursor: "not-allowed", ... }}`
- `CopyCSSBtn css`: `.form-textarea--readonly { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #fafaf9; cursor: not-allowed; resize: vertical; min-height: 80px; }`

**Disabled textarea**
- Label: "Internal Notes"
- `disabled` + `style={{ backgroundColor: "var(--slds-g-color-neutral-95)", cursor: "not-allowed", ... }}`
- `CopyCSSBtn css`: `.form-textarea--disabled { width: 100%; padding: 8px 12px; border: 1px solid #dddbda; border-radius: 4px; font-size: 13px; background-color: #f3f2f2; cursor: not-allowed; resize: vertical; min-height: 80px; }`

Also update `ShowcaseCard cssCode` on FRM-03 to include the new modifier classes.

---

## Verification

1. Open Components tab → Form Controls section
2. FRM-01: 7 rows visible — Label, Default, Placeholder, Error, Read-Only, Disabled, Focus
3. FRM-02: Select (default + disabled), Checkbox (4 variants), Toggle (4 variants), each with `CopyCSSBtn`
4. FRM-03: 5 textarea columns — Default, Placeholder, Error, Read-Only, Disabled
5. Hover any card → PatternIdBadge with Copy Link + Copy CSS appears
6. Click each `CopyCSSBtn` → copied CSS contains only absolute hex values, no `var(--...)` tokens
