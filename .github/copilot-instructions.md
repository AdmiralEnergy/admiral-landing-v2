<!--
Guidance for AI coding agents working on the Admiral Energy landing repo.
Keep this file short (20–50 lines) and focused on project-specific patterns, tooling, and files to inspect.
--> 

# Admiral Energy — Copilot / AI agent instructions

Quick context
- Small React + Vite + TypeScript landing site. See `README.md` and `package.json` for scripts.
- Builds with Vite; dev: `npm run dev`, build: `npm run build`, preview: `npm run preview`.

What to read first
- `package.json` — scripts and top-level deps (React, Vite, Tailwind).
- `vite.config.ts` — dev/build plugins and entry points.
- `src/` and `app/` — actual application code. `src/main.tsx` or `src/main.js` is the client entry.
- `public/` and `assets/` — static assets used by pages.
- `netlify/` — serverless functions and edge utilities (important if editing server-side behaviour).

Architecture notes (short)
- Frontend-only single-page app built with React + Vite. TypeScript present but some legacy JS files remain (both `.js` and `.tsx` coexist).
- Routes are declared in `src/router.tsx` / `src/router.js` and pages live in `src/pages/`.
- Visual/layout components are under `src/components/` and `app/` contains additional entry-level assets and possible alternate entry points.
- Server-side logic (email/sms) lives under `netlify/functions/` and `netlify/edge-functions/` — treat these as separate deployable units.

Project-specific conventions
- Keep changes to TypeScript types in `src/types/globals.d.ts` or the `types/` folder.
- Files with both `.js` and `.ts[x]` names indicate gradual migration; prefer matching existing file style in the same folder when making small edits.
- Tailwind is used — styles are in `src/index.css` and `tailwind.config.cjs`.

Build & debugging tips
- Use `npm run dev` for local HMR. Vite serves the SPA at http://localhost:5173 by default.
- Serverless functions under `netlify/functions/` are not automatically run by Vite; use Netlify CLI or deploy previews to test them, or write small unit tests that call function handlers directly.

Integration points to watch
- `netlify.toml` controls Netlify builds and redirects; changes here affect deploy behavior.
- `netlify/edge-functions/zip-utility-lookup.js` and other edge code are executed at the CDN edge — avoid importing Node-only modules there.

When you edit code, prioritize
1. Small, focused changes that follow surrounding file style (JS vs TS).
2. Update `src/types/globals.d.ts` when public objects change.
3. If modifying serverless functions, ensure exports match Netlify handler shape used in existing functions.

Examples to inspect when implementing features
- Adding a route: follow `src/router.tsx` and add pages to `src/pages/`.
- Asset references: use files under `assets/` (top-level `assets/` or `src/assets/`) so Vite handles bundling.

Files to open when troubleshooting
- `package.json`, `vite.config.ts`, `netlify.toml`, `netlify/functions/*`, `netlify/edge-functions/*`, `src/router.tsx`, `src/main.tsx`, `src/pages/*`, `src/components/layout/Header.tsx`.

Notes / constraints
- Keep changes minimal in `netlify/` unless you can run Netlify CLI locally — Vite won’t exercise those during dev.
- Don’t assume full TypeScript coverage; type carefully and prefer small opt-ins (declare types in `globals.d.ts`).

If unclear, ask for:
- preferred TypeScript strictness or whether JS-to-TS migration is desired for the task
- whether Netlify function behavior should be tested locally (and if Netlify CLI is available)
