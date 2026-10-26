# Claude Code --- Strict Component Reuse & Design-System Compliance

> **Purpose:** Attach this file to implementation prompts to ensure new
> features use the project's existing UI components and design system
> without unnecessary overrides, duplicate implementations, or visual
> drift.

## Project-specific source of truth

**The project's reusable UI components are located in:
`src\app\components\ui`**

Treat this directory as the primary source of truth for reusable UI
components.

-   Before implementing any UI, inspect this directory and identify
    components relevant to the requested feature.
-   Inspect the actual component source, props, variants, sizes,
    slots/children, states, and built-in styles. Do not rely on
    filenames or assumptions.
-   Search for usage examples and related components when needed.
-   Import and use the existing components from this directory wherever
    suitable.
-   Do not create a replacement, duplicate, or page-local version of a
    component that already exists here.
-   If a needed component is not found in this directory, search the
    rest of the project for an existing equivalent before concluding
    that it is missing.

## Mandatory implementation rules

### 1. Inspect before implementing

-   Before writing code, inspect the relevant project files and identify
    the existing components, variants, tokens, utilities, and page
    patterns that apply to the requested feature.
-   Check component APIs and implementation details rather than
    guessing.
-   Reuse the project's established patterns and conventions. Do not
    assume a component is missing until you have searched for it.

### 2. Use existing components directly

-   **Prefer the existing reusable component whenever a suitable one
    exists.**
-   Use the component through its supported public API: documented
    props, variants, sizes, slots, and composition patterns.
-   Do not recreate an existing component with raw HTML, a different
    library, or a one-off implementation.
-   Do not wrap a component in extra elements solely to reproduce
    styling or behavior it already provides.
-   Do not copy-paste component internals into a page or create a
    near-duplicate component.

### 3. No styling layered on top of components

-   **Do not add page-level CSS, utility classes, inline styles, or
    selectors to restyle an existing component.**
-   Do not append custom spacing, color, typography, border, radius,
    shadow, sizing, hover, focus, or state overrides to a component just
    to make it look different.
-   Do not use `!important`, global selectors, deep selectors, or CSS
    overrides to bypass the component's styling.
-   Do not alter component appearance through parent selectors or
    wrapper styles when that changes the component's established visual
    design.
-   If a component exposes a supported variant or prop for the required
    appearance, use that API. Do not simulate the variant with custom
    CSS.
-   Layout CSS may be used for surrounding page structure (such as grid
    columns or section spacing) only when it does not override or
    redefine the component's own styling.

### 4. Follow the design system exactly

-   Use existing design tokens, CSS variables, theme values, typography
    styles, spacing scales, colors, radii, shadows, and icon
    conventions.
-   Do not hardcode new design values when an established token or
    utility exists.
-   Do not introduce a new visual style, component variant, or design
    token without a clear requirement and explicit justification.
-   Preserve existing interaction patterns, responsive behavior,
    accessibility conventions, and theme behavior where applicable.
-   Match existing pages and flows in visual hierarchy, density,
    alignment, and component composition.

### 5. When a required component or capability is missing

-   Do not silently substitute a custom, one-off component or style an
    unrelated component to imitate it.
-   First search `src\app\components\ui`, then search the rest of the
    project for an equivalent component, primitive, or established
    pattern.
-   If none exists, explain what is missing and identify the smallest
    reusable addition needed.
-   Only create a new component or extend an existing one when necessary
    for the requested feature.
-   Put reusable styling and behavior inside the shared component---not
    in the consuming page.
-   Keep any new variant or API consistent with the existing component
    architecture. Avoid breaking existing consumers.

### 6. Keep page code focused on composition

-   Pages should compose existing components and provide content, data,
    and handlers through their APIs.
-   Keep component-specific visual styling inside the component
    implementation.
-   Avoid one-off component-specific classes in page files.
-   Do not duplicate validation, interaction, accessibility, or state
    behavior that the component already handles.
-   Preserve existing project structure, naming, imports, and coding
    conventions unless the task explicitly requires a change.

### 7. Preserve behavior and accessibility

-   Use the component's intended interaction model and built-in states.
-   Preserve keyboard behavior, focus handling, labels, accessible
    names, and semantic structure.
-   Do not remove or bypass existing loading, disabled, error, empty,
    selected, or responsive states.
-   Do not make a visual change that breaks interaction or
    accessibility.

## Required workflow

1.  **Inspect:** Start with `src\app\components\ui`. Review relevant
    component source, styles, and usage examples; then inspect related
    tokens and comparable screens.
2.  **Map:** Identify which existing component should serve each UI
    element in the requested flow.
3.  **Implement:** Compose those components using supported APIs. Keep
    custom styling out of component usage.
4.  **Verify:** Review the diff for raw-HTML recreations, duplicate
    components, added overrides, hardcoded design values, and unintended
    changes.
5.  **Report:** Briefly state which existing components were reused,
    whether any shared component needed modification, and any genuine
    gaps or deviations.

## Final self-check --- do not skip

-   [ ] I inspected `src\app\components\ui` before implementing.
-   [ ] I reused suitable existing components from that directory.
-   [ ] I used supported component props/variants instead of manually
    restyling components.
-   [ ] I did not add extra classes, inline styles, CSS overrides, or
    hardcoded design values to existing components.
-   [ ] I did not recreate existing components using raw HTML or
    duplicate implementations.
-   [ ] Any necessary new component or variant is reusable and
    implemented in the shared component layer.
-   [ ] The page follows existing design tokens, patterns, responsive
    behavior, and accessibility conventions.
-   [ ] I reviewed the final diff and removed unnecessary styling and
    unrelated changes.

If any item cannot be satisfied, **do not silently proceed**. Explain
the specific reason and the smallest appropriate exception.

## Priority rule

The existing component library---especially
`src\app\components\ui`---and the established design system take
precedence over convenience or personal styling preferences. A requested
feature does not authorize visual redesign or component-level overrides
unless the user explicitly asks for that change.

**Implement the requested functionality by composing the existing
system---not by creating a parallel one.**
