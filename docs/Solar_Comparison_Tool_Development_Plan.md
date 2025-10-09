# Solar Comparison Tool — Development Plan (Canonical Baseline)

**Project:** Admiral Energy Solar Analysis Platform  
**Canonical Component:** `src/routes/advisor/solar-comparison-tool.tsx` (Claude-built)  
**Route:** `/advisor` renders the canonical tool.  
**Status:** Active baseline — all work **builds on this**, never replaces it.

---

## 1) Canonical-First Policy (Non‑negotiable)

- The Claude-built `solar-comparison-tool.tsx` is the **source of truth** for `/advisor`.
- Never overwrite or reduce the canonical file. When changes are needed:
  - Create a **replica** under `src/routes/advisor/versions/YYYYMMDD/` and edit the replica.
  - Keep `/advisor` pointing to the most recent **approved** version.
- If an alternate UI (e.g., a lead-intake wizard) is required, mount it on a **separate route** (`/intake`, `/advisor-intake`) — do not mount over `/advisor`.

---

## 2) File Layout & Versioning

```
src/
  routes/
    advisor/
      solar-comparison-tool.tsx         # Canonical base (never deleted)
      versions/
        2025-10-09/
          SolarComparisonTool.v1.tsx    # First replica for feature work
      wizard/                           # Optional: current 4-step intake
        index.tsx
```

- **Canonical name stays:** `solar-comparison-tool.tsx`
- **Replicas are dated:** `versions/YYYY-MM-DD/SolarComparisonTool.vN.tsx`
- **Router:** `/advisor` points to the **approved** version (canonical or latest). Wizard lives at `/intake`.

---

## 3) Routing Rules

- `/advisor` → canonical comparison tool (or its versioned successor after approval)
- `/intake` (or `/advisor-intake`) → 4-step lead wizard (optional, preserved)
- No other route may replace `/advisor` without a PR checklist explicitly confirming the canonical tool remains routable elsewhere.

**Router snippet (example):**
```tsx
// /advisor → canonical tool
{
  path: '/advisor',
  lazy: async () => {
    const m = await import('./routes/advisor/solar-comparison-tool');
    return { Component: m.default };
  },
},
// /intake → wizard
{
  path: '/intake',
  lazy: () => import('./routes/advisor/wizard/index'),
},
```

---

## 4) PR Guardrails

Add a PR template checkbox (required to merge):
- [ ] `/advisor` renders the canonical Solar Comparison Tool (or an approved versioned successor).
- [ ] If a wizard or alternate UI is updated, it is mounted on a separate route (not `/advisor`).
- [ ] No deletion/overwriting of `solar-comparison-tool.tsx`.
- [ ] Smoke test passes: `/advisor` contains “Sungage Financing Options” and “Cumulative Cost Analysis”.

Optional: add `CODEOWNERS` so any PR touching `/advisor` requires @AdmiralEnergy review.

---

## 5) Environment & Build

- `VITE_ENABLE_ADVISOR` no longer controls inclusion of the canonical route; `/advisor` is **always included**.
- Netlify SPA redirect:
  - `netlify.toml` → `[[redirects]] from = "/*" to = "/index.html" status = 200`
- Basic-Auth applies **only in production** under `[context.production]` headers.

---

## 6) Migration Policy for “Old” Files (What to Do)

- Do **not** delete previous artifacts. Move them to a safe location:
  - Wizard → `src/routes/advisor/wizard/index.tsx` + route `/intake`
  - Any experimental tool → `versions/YYYY-MM-DD/` as read-only reference
- The canonical file **remains** at `src/routes/advisor/solar-comparison-tool.tsx`.
- If a new version becomes canonical, **copy** it to the canonical filename in a single PR that:
  - Updates the file content
  - Keeps the prior version archived under `versions/`
  - Runs the smoke test

---

## 7) Today’s Action Items (lightweight, incremental)

### To VS Code (remote-friendly; file edits only)
1. Ensure canonical file is present at:
   - `src/routes/advisor/solar-comparison-tool.tsx`
2. Router uses canonical file at `/advisor` (see snippet above).
3. Move wizard to:
   - `src/routes/advisor/wizard/index.tsx` mounted at `/intake`

### Optional (local if terminal already open)
```bash
git checkout -b docs/canonical-tool-plan
git add docs/Solar_Comparison_Tool_Development_Plan.md
git commit -m "docs(advisor): add canonical-first development plan for solar comparison tool"
git push -u origin docs/canonical-tool-plan
gh pr create -B main -t "docs: canonical dev plan for /advisor" -b "Establishes solar-comparison-tool.tsx as canonical, adds versioning & routing rules."
```

---

## 8) Why This Exists

The solar comparison tool is the **business-critical engine**. We will **build it up**, never replace it unintentionally. This plan eliminates route swaps, silent reductions, and accidental rewrites.
