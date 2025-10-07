<!-- Short, targeted instructions for AI coding agents working on this repo. -->

> Internal note: This guide is for AI and automation tools working inside this repo.
> Do not edit build, deploy, or config files based on assumptions — always verify with `npm run build` and confirm output in `dist/` before pushing.

# Admiral Energy — Copilot / AI agent instructions

Stack & constraints
- Vite + React + TypeScript. Tailwind v3 for styles (`tailwind.config.cjs`). Project targets Node 22 for Netlify builds.

Scripts (confirm in `package.json`)
- dev: `npm run dev` — local Vite with HMR
- build: `npm run build` — outputs `dist/`
- preview: `npm run preview`

Build & deploy (guardrails)
- Build: `npm run build` → `dist/`. Netlify is used for deployment (Node 22).
- SPA redirect rule: `/*` → `/index.html` (HTTP 200) — check `netlify.toml` for redirects.

Branching & PR rules (required)
- Production branch: `main` = prod. Feature work goes on `feat/*` branches. Open PRs for all changes; do not push directly to `main`.

Routing & pages
- Uses React Router. Landing page is the index route; keep the `*` catch-all route last.
- Key files: `src/router.tsx`, `src/pages/SolarComparisonTool.tsx`, `src/pages/SolarCalculator.tsx` (PascalCase filenames only).

Analytics & pixels
- GA4 and Reddit pixel are present. Do not add duplicate pixel blocks; reuse the existing integration.

File map & conventions
- Entry: `src/main.tsx` or `src/main.js`; styles in `src/index.css`.
- Pages: keep PascalCase (`SolarCalculator.tsx`, `SolarComparisonTool.tsx`).
- Types: add public types to `src/types/globals.d.ts`.
- Do NOT commit compiled `.js` twins next to `.tsx` files.

Done criteria
- Project builds clean (`npm run build`).
- Routes deep-link (refresh on nested routes works).
- Netlify Forms capture submissions where used.
- GA4/Reddit pixels fire without duplication.

Do / Don’t
- Do: keep PascalCase page filenames; follow existing JS vs TS style in a folder.
- Don’t: commit compiled `.js` alongside `.tsx` sources; don’t add duplicate analytics snippets.

Optional — quick how-tos for agents
- Add a lazy route (React lazy + Suspense):

```js
// in src/router.tsx
const SolarComparison = lazy(() => import("./pages/SolarComparisonTool"))
// <Route path="/compare" element={<Suspense><SolarComparison/></Suspense>} />
```

- Calculator form submit pattern (static Netlify form or fetch): include a hidden `form-name` field and POST as URL-encoded when using Netlify Forms.

```html
<form name="calculator" method="POST" data-netlify="true">
	<input type="hidden" name="form-name" value="calculator" />
	<!-- fields... -->
</form>
<!-- or client-side: fetch('/?no-cache=1', { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams(form) }) -->
```

TL;DR
- Keep this file. It’s in the right place. Follow the branch/deploy guardrails above and prune any non-discoverable assumptions before making changes.
