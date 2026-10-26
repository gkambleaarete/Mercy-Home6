# Mercy Home Engineering + UX Implementation Guidelines

## Purpose
This document defines the mandatory implementation standards for all Mercy Home feature development, enhancements, refactors, validations, and AI-assisted coding workflows.

All referenced materials, designs, acceptance criteria, flows, screenshots, architecture notes, and UX requirements are assumed to be attached or provided alongside the task.

---

# Core Principles

## Follow Provided Requirements Strictly
Engineers and AI coding tools must:
- Implement only what is defined
- Avoid assumptions
- Avoid fabricated logic
- Preserve UX intent
- Preserve Mercy Home branding consistency
- Preserve SLDS 2 standards
- Validate implementation against acceptance criteria before completion

If information is unclear:
- Flag the gap
- Do not invent behavior
- Do not fabricate workflows
- Do not create unsupported business logic

---

# SLDS 2 Compliance

All experiences must align with:
- Salesforce Lightning Design System 2
- Existing Mercy Home branding
- Existing design tokens
- Existing spacing system
- Existing typography hierarchy
- Existing interaction patterns
- Existing accessibility standards

Maintain:
- Pixel consistency
- Consistent spacing hierarchy
- Responsive behavior
- Semantic structure
- Reusable SLDS-compliant components
- Consistent form behavior
- Consistent modal behavior
- Consistent table patterns
- Consistent card patterns

Avoid:
- Non-SLDS UI libraries
- Random component styling
- Inconsistent visual behavior
- Bootstrap-like patterns
- Material UI styling approaches
- Unapproved Tailwind overrides
- Inconsistent spacing systems
- Non-standard interaction patterns

---

# UX Standards

Every implementation must:
- Match approved Figma behavior
- Preserve layout consistency
- Maintain accessibility
- Support responsive behavior
- Follow approved workflows
- Respect information hierarchy
- Preserve UX annotations and logic
- Maintain interaction consistency
- Preserve emotional sensitivity of Mercy Home workflows

---

# Date & Time Input Standards

All date and time fields across the Mercy Home experience must follow a consistent formatting and interaction pattern.

## Date Format Standards

Mandatory date format:
- MM/DD/YYYY

Examples:
- 04/16/2026
- 12/01/2026

Rules:
- Leading zeros must be preserved
- Input masking should guide the user while typing
- Invalid dates must be prevented
- Partial date entries should show validation feedback
- Date picker behavior must remain SLDS 2 compliant

Avoid:
- DD/MM/YYYY
- YYYY-MM-DD in UI-facing inputs
- Mixed regional formats
- Freeform date entry without validation

---

## Time Format Standards

Mandatory time format:
- 12-hour clock
- hh:mm AM/PM

Examples:
- 4:00 PM
- 9:30 AM
- 12:15 PM

Rules:
- Time inputs must support intelligent auto-formatting
- Typing shorthand values should auto-complete intelligently

Example behaviors:
- Typing `4` should auto-populate to:
  - `4:00 PM` if current system time is afternoon/evening
  - `4:00 AM` if current system time is morning

Additional examples:
- `430` → `4:30 PM`
- `915` → `9:15 AM`
- `12` → `12:00 PM`

The system should:
- Infer AM/PM context intelligently based on current time and logical user behavior
- Allow manual override of AM/PM
- Preserve keyboard accessibility
- Support masked formatting while typing
- Prevent invalid time values

Avoid:
- 24-hour time format
- Unformatted numeric input
- Freeform ambiguous time entries
- Manual colon insertion requirements for basic inputs

---

# Smart Input Experience Standards

All smart formatting behaviors must:
- Feel natural and predictable
- Reduce typing effort
- Minimize cognitive load
- Preserve accessibility standards
- Remain mobile friendly
- Remain SLDS 2 compliant

Smart behaviors must NEVER:
- Override intentional user edits unexpectedly
- Cause cursor jumping issues
- Create aggressive auto-corrections
- Break keyboard navigation patterns

---

# Accessibility Standards

Mandatory accessibility checks:
- Keyboard navigation
- Focus states
- Semantic HTML
- ARIA support
- Color contrast compliance
- Screen-reader compatibility
- Logical tab ordering
- Accessible form labels
- Accessible validation messaging

---

# Vibe Coding Rules

AI-assisted rapid development is allowed ONLY when:
- UX intent is preserved
- SLDS 2 standards are maintained
- Acceptance criteria are verified
- Generated outputs are reviewed
- Functional logic is validated
- Accessibility standards are preserved

Velocity must never compromise:
- Quality
- Maintainability
- Accessibility
- Consistency
- Functional accuracy
- UX integrity

---

# Functional Verification Checklist

Before completion verify:
- Acceptance criteria passed
- Business rules implemented
- Edge cases handled
- Validation states working
- Error states handled
- Conditional rendering functioning
- Role-based logic verified
- Loading states handled properly
- Smart date/time formatting behaves correctly
- Input masking functions properly
- SLDS interactions remain consistent

---

# UX Verification Checklist

Verify:
- Figma alignment
- Typography accuracy
- Spacing consistency
- Interaction consistency
- Responsive behavior
- Component hierarchy
- Modal behavior
- Table interactions
- Form consistency
- Mercy Home branding consistency

---

# Code Quality Rules

Maintain:
- Reusable structure
- Naming consistency
- Clean architecture
- Minimal duplication
- Readable organization
- Centralized configuration where appropriate
- Token-driven styling

Avoid:
- Dead code
- Hardcoded styles
- Unnecessary abstractions
- Random wrappers
- Temporary hacks left in production
- Duplicate component logic
- Inline inconsistent styling

---

# Anti-Hallucination Rules

Never:
- Invent APIs
- Create fake schemas
- Assume backend behavior
- Infer undocumented business rules
- Generate unsupported data structures
- Create fictional workflows
- Add hidden functionality not requested

When uncertain:
- Stop
- Flag ambiguity
- Request clarification
- Preserve existing architecture and UX patterns

---

# Final Delivery Requirements

Every completed implementation must include:

1. Scope Summary
2. Acceptance Criteria Mapping
3. Gap Analysis
4. Functional Verification
5. UX Verification
6. SLDS 2 Compliance Check
7. Accessibility Validation
8. QA/UAT Notes
9. Known Risks or Dependencies

---

# Mercy Home Experience Standards

The experience should feel:
- Calm
- Structured
- Human-centered
- Emotionally considerate
- Operationally clear
- Accessible
- Modern but familiar to Salesforce users

Avoid:
- Over-designed UI
- Heavy visual clutter
- Unnecessary motion
- Enterprise dashboard fatigue
- Aggressive interactions
- Excessively dense layouts

The UX should balance:
- Salesforce ecosystem familiarity
- Modern UX standards
- Emotional sensitivity of Mercy Home workflows
- Operational efficiency
- Accessibility and clarity

---

# Final Rule

Before finalizing implementation ask:

- Does this match acceptance criteria?
- Does this preserve UX intent?
- Does this align with SLDS 2?
- Does this align with Mercy Home branding?
- Does this avoid assumptions?
- Would this pass UX review?
- Would this pass engineering review?
- Would this pass stakeholder walkthrough?
- Would this pass accessibility validation?

If not:
Refine before delivery.