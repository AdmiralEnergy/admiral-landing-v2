### What
- Header: logo next to “Admiral Energy”; removed Advisor link.
- Footer: replaced ⚡ with logo.
- Branding: tab title + favicon/apple-touch-icon set.
- Advisor:
  - Inputs start blank (no stale quote).
  - Duke Bill fields are editable.
  - “Duke Bill (after solar offset)” is derived from top Solar Offset (%).
  - Totals recompute; type-safe math; Clear All button.

### Why
Cleaner public branding, keep /advisor internal-only, and fix quoting workflow (editable Duke, correct offset).

### QA
- Header shows logo; footer shows logo.
- Favicon/tab title say Admiral Energy.
- /advisor: fields blank → edit Duke → offset changes solar card automatically → totals update.
- Clear All resets numbers to blank.
- Mobile + desktop OK.

### Safety
Surgical component changes, no router churn; arithmetic guarded with safe coercion.
