# Admiral Energy — `/advisor` App: Development Guide (Living Spec)

**Purpose (why this exists)**  
This document is the single source of truth for building and iterating the **Advisor** flow on the landing site. It ties together product intent, UI/UX, data model, analytics, QA, and release process—so code, content, and campaigns stay in lockstep.

## 0) TL;DR (what to build first)
- New route: `/advisor` (client-side SPA route)
- 4-step guided flow:
  1) **Address & Utility** (ZIP → utility pick, HOA? y/n)
  2) **Bill & Usage** (avg bill, optional kWh, TOU awareness)
  3) **Roof & Backup** (own roof? shade? battery interest)
  4) **Contact & Review** (name, email, phone → submit)
- Output: confirmation screen + Netlify Form submission + GA4/Reddit events.
- Timebox MVP: one afternoon. Then iterate visuals and logic.

---

## 1) Architecture & Files

**Route**  
- `src/routes/advisor/index.tsx` (lazy-loaded via React Router)
- `src/routes/advisor/steps/*` (one file per step)
- `src/routes/advisor/state.ts` (Zustand or React Context for wizard state)
- `src/components/advisor/*` (shared UI pieces)
- `src/config/analytics.ts` (GA4 + Reddit helpers)
- `src/config/constants.ts` (brands, colors, utility enums)
- **Form sink**: Netlify Forms (hidden `<form name="advisor-intake" netlify>`)

**Tech constraints**
- TS strict on
- Tailwind v3 pinned
- No new deps for MVP (use native `fetch`, simple Context/Zustand if already present)

**Routing**
```tsx
// in src/main.tsx or router file
<Route path="/advisor" element={<AdvisorApp />} />
```

## 2) UX Flow (MVP → V1)
Step 1: Address & Utility

Inputs: ZIP (5 digits), utility (auto-suggest from ZIP; editable), HOA (y/n)

Derived: service territory hint, policy copy tweak

Validation: ZIP required

Step 2: Bill & Usage

Inputs: Avg bill ($), optional kWh/mo, rate plan (flat/TOU/unknown)

Helpers: “Not sure?” link that explains how to read a bill

Validation: bill required, numeric; guardrails $50–$900

Step 3: Roof & Backup

Inputs: Roof type (asphalt/metal/other), shade (none/some/heavy), battery interest (y/n/maybe)

Copy: small benefits callout for batteries (resilience, TOU protection)

Step 4: Contact & Review

Show summary; allow edits.

Inputs: First, Last, Email, Phone (consent checkbox)

On submit:

Save to Netlify Forms (advisor-intake)

Fire analytics (GA4 + Reddit)

Thank-you: “Bill Audit in 24–48h” + CTA to upload bill (optional)

Thank-You (Post-Submit)

Display next steps, optional file-upload link (phase 2)

Offer booking button (Calendly) in V1

## 3) Data Model (client state)

```ts
export type AdvisorState = {
  zip: string;
  utility: 'DEP' | 'DEC' | 'Union Power' | 'Other';
  hoa: boolean;

  avgBill: number;
  kwh?: number;
  ratePlan?: 'flat' | 'tou' | 'unknown';

  roofType?: 'asphalt' | 'metal' | 'tile' | 'other';
  shade?: 'none' | 'some' | 'heavy';
  batteryInterest?: 'yes' | 'no' | 'maybe';

  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  utm?: Record<string, string>;
};
```

Serialization (for Netlify Forms payload)

Add hidden inputs mirroring the fields.

Preserve utm_* from localStorage.utm if available.

## 4) Visual System
Brand: Navy #0c2f4a, Gold #c9a648, Off-white #f7f5f2

Stepper across top (1–4)

Card layout, soft shadow, rounded-2xl

Large inputs, mobile-first, single column

Progress persist on refresh (LocalStorage key: advisor:v1)

## 5) Validation & Guardrails
ZIP: ^\\d{5}$

Bill: 50 ≤ bill ≤ 900 (soft warning if outside)

Email + phone basic regex; consent required

Disable submit until valid; show inline helper text

## 6) Analytics & Pixel Events
GA4 events (via window.gtag)

advisor_step_view { step: 1|2|3|4 }

advisor_field_change { field: 'avgBill' | ... } (sample, throttle)

advisor_submit_attempt

advisor_submit_success { batteryInterest, ratePlan, utility }

Reddit Pixel

On page render: PageVisit already fires globally.

On success: rdt('track', 'Lead') with lightweight metadata (if allowed).

UTM handling

On first hit, parse querystring, store in localStorage.utm, attach to form hidden inputs.

## 7) Netlify Forms (no server code required)

```html
<form name="advisor-intake" method="POST" data-netlify="true" hidden>
  <input type="hidden" name="form-name" value="advisor-intake" />
  <!-- hidden mirrors of state go here before programmatic submit -->
</form>
```

Submit path (MVP)

Populate hidden form inputs from state.

form.submit(); then route to thank-you.

Also fetch('/') with Content-Type: application/x-www-form-urlencoded (double-submit fallback acceptable on Netlify).

## 8) Accessibility & Performance
Labels for all inputs; aria-invalid on errors

Keyboard nav between steps

prefers-reduced-motion: disable stepper animations

No layout shift between steps; skeleton shimmer ok

Lighthouse ≥ 90 on Mobile

## 9) Definition of Done (for every change)
Compiles (local + CI), Node 22

Forms land in Netlify (see Forms dashboard)

GA4 & Reddit events verified (Realtime & Pixel Helper)

Deep-link safe (SPA redirect present)

Responsive on iPhone/Android common sizes

No new packages for MVP

## 10) Milestones
MVP (today)

Route, 4 steps, validation, Netlify submit, basic GA4 + Reddit Lead

V1 (this week)

Calendly on TY screen

Persist state to LocalStorage

Helper copy for “read your Duke bill”

TOU explainer micro-modal

V1.1

File upload (bill) to Netlify form-uploads

Utility auto-detect by ZIP (tiny lookup map)

## 11) References (keep these nearby)
docs/AI-Integrated Dev Operating Note (env, build, deploy)

GA4 Measurement ID (env: VITE_GA_ID)

Reddit Pixel ID (env: VITE_REDDIT_PIXEL_ID)

Brand colors & assets list

SEO & Landing patterns (guardrails for copy and CTAs)

## 12) QA Checklist (pre-merge)
 Form arrives in Netlify Forms with all fields + UTM

 advisor_submit_success appears in GA4 Realtime

 Reddit Pixel shows Lead event

 Mobile: iPhone Safari & Android Chrome pass

 Stepper state preserved on back/forward

 Lighthouse ≥ 90 (mobile)

## 13) Rollback
Netlify → Deploys → restore last known good. Leave incident note in PR.

Owner
PM: David (scope, messaging, offer)

Dev: You

Analytics: You (verify events), with future help as needed

Status
Draft v1 — use it, edit it, commit improvements with the code.

Commit Footer Template
refs: advisor-spec v<version>; GA4 ok; Netlify forms ok
