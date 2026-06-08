# Tenun — Career Discovery for Students & Fresh Graduates

**Don't know your job title? Tell Tenun what you enjoy, and it weaves that into real career paths.**

Tenun is a career discovery and CV/profile platform for students, fresh graduates, and early‑career users in Malaysia — with a dedicated employer side for hiring better‑fit early talent. You describe what you enjoy in plain language; Tenun's AI maps it to real job titles with salary ranges, day‑to‑day breakdowns, required skills, and a step‑by‑step path. A friendly mascot chatbot ("Tenun Guide") helps users navigate, and the whole experience is available in **English** and **Bahasa Melayu**.

> Tenun helps you explore possibilities. It does **not** guarantee employment outcomes.

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Architecture](#architecture)
- [Key user flows](#key-user-flows)
- [API routes](#api-routes)
- [Internationalization (i18n)](#internationalization-i18n)
- [Tenun Guide chatbot](#tenun-guide-chatbot)
- [Deployment](#deployment)
- [Scripts](#scripts)

---

## Features

### For Weavers (job seekers)
- **Plain‑language career search** — type "I like working with data" and get **6 genuinely different** role suggestions (AI‑generated).
- **Job detail breakdowns** — required & nice‑to‑have skills, the "secret sauce" that separates hired candidates, honest fit questions, common gaps, and entry paths.
- **Profile & CV upload** — upload a CV/resume/portfolio (PDF/DOCX) to pre‑fill a career profile, or fill it in manually.
- **Dashboard** — a multi‑pane "career weave": pathways, skills/skill‑gaps, opportunities, a global career **Atlas**, **mentors**, **outreach** drafts, and a **CV/portfolio** builder.
- **CV builder** — create a CV, pick a template (Harvard / Creative), import an existing CV, and edit block by block.

### For Employers
- Landing page explaining how Tenun surfaces context‑rich, better‑fit early‑career candidates.
- Candidate‑signal cards, a comparison vs. traditional job boards, a mock recruiter portal preview, and a **role intake form**.

### Platform
- **AI with automatic fallback** — OpenRouter (primary) → Groq (fallback), server‑side only.
- **Tenun Guide** — a floating mascot chatbot that answers strictly from a controlled knowledge base and escalates to a support email when unsure (no hallucination).
- **Bilingual** — English / Bahasa Melayu, with a navbar switcher; the AI replies in the selected language too.
- **Auth** — Google sign‑in via Supabase (optional; the app runs without it).
- **Rate limiting** — IP‑based on AI routes via Upstash Redis (optional; skipped if not configured).

---

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router), [React 18](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/), [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| UI primitives | [Radix UI](https://www.radix-ui.com/), [shadcn/ui](https://ui.shadcn.com/) patterns, [Lucide](https://lucide.dev/) icons |
| Animation | [Framer Motion](https://www.framer.com/motion/) |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) + [React-Redux](https://react-redux.js.org/) |
| Charts / maps | [Recharts](https://recharts.org/), [react-simple-maps](https://www.react-simple-maps.io/) |
| Drag & drop | [dnd-kit](https://dndkit.com/) (CV block editor) |
| Auth & DB | [Supabase](https://supabase.com/) (`@supabase/ssr`) |
| AI | [OpenRouter](https://openrouter.ai/) (primary) + [Groq SDK](https://groq.com/) (fallback) |
| Rate limiting | [Upstash Ratelimit + Redis](https://upstash.com/) |
| File parsing | [pdf-parse](https://www.npmjs.com/package/pdf-parse), [mammoth](https://www.npmjs.com/package/mammoth) (DOCX) |

---

## Getting started

### Prerequisites
- **Node.js 18+**
- npm (or yarn/pnpm)

### Install & run
```bash
git clone https://github.com/jinchuntan/tenun-mock.git
cd tenun-mock
npm install

# Set up environment (see the next section)
cp .env.example .env.local
# …then edit .env.local and add at least OPENROUTER_API_KEY

npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

> The app **builds and runs without any keys**, but AI features (search, job detail, Tenun Guide) will return a graceful fallback message until you add an AI provider key.

---

## Environment variables

Copy `.env.example` → `.env.local` and fill in what you need. `.env.local` is git‑ignored — never commit real keys.

> ⚠️ Only variables prefixed `NEXT_PUBLIC_` are exposed to the browser. AI and Supabase **service** keys must stay un‑prefixed (server‑side only).

### Required — at least one AI provider
| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | **Primary** AI provider. Get one at [openrouter.ai/keys](https://openrouter.ai/keys). |
| `GROQ_API_KEY` | **Fallback** AI provider (used if OpenRouter fails/rate‑limits). Optional but recommended. |

### Recommended — full functionality
| Variable | Purpose | Fallback if unset |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Google sign‑in, sessions) | Auth disabled, app still runs |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key | Auth disabled |
| `NEXT_PUBLIC_TENUN_SUPPORT_EMAIL` | Email the Tenun Guide redirects users to when unsure | `support@tenun.example` placeholder |

### Optional — sensible defaults exist
| Variable | Purpose | Default |
|---|---|---|
| `OPENROUTER_MODEL_JOB_INTENT` | Model for career search | `qwen/qwen3-next-80b-a3b-instruct:free` |
| `OPENROUTER_MODEL_JOB_DETAIL` | Model for job detail | same |
| `OPENROUTER_MODEL_RESUME_PARSE` | Model for resume parsing | same |
| `OPENROUTER_MODEL_SITE_GUIDE` | Model for Tenun Guide | same |
| `OPENROUTER_MODEL_CV_GENERATE` | Model for the CV Generator | same |
| `OPENROUTER_MODEL_CV_ASSISTANT` | Model for the in-editor CV Assistant | same |
| `OPENROUTER_MODEL_PERSONALIZE` | Model for the dashboard personalization layer (summary, pathway, skill‑gaps, outreach) | same |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL | `https://openrouter.ai/api/v1` |
| `GROQ_MODEL` | Groq fallback model | `llama-3.3-70b-versatile` |
| `OPENROUTER_SITE_URL` | OpenRouter attribution header | `http://localhost:3000` (set to your domain) |
| `OPENROUTER_APP_NAME` | OpenRouter attribution | `Tenun` |
| `OPENROUTER_DATA_COLLECTION` | `deny` keeps prompts out of training | `deny` |
| `UPSTASH_REDIS_REST_URL` | Enables IP rate limiting on AI routes | Rate limiting skipped |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash token | Rate limiting skipped |

**Minimum viable setup:** just `OPENROUTER_API_KEY`.

> ⚠️ **Server-side only.** AI keys must never be prefixed with `NEXT_PUBLIC_` — that would expose them to the browser.

### Making AI work on Vercel (production)

The AI keys are **not** bundled at build time — they're read at runtime on the server. You must add them in **Vercel → Project → Settings → Environment Variables → Production**, then **redeploy** (a plain refresh is not enough):

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_SITE_URL=https://tenun-mock.vercel.app
OPENROUTER_APP_NAME=Tenun
OPENROUTER_DATA_COLLECTION=deny
# Optional fallback:
GROQ_API_KEY=your_key_here
```

**Verify it works** (no keys are ever returned):

- `GET /api/ai-health` → confirms `openrouterConfigured: true` and shows the resolved model ids.
- `GET /api/ai-health?test=true` → makes a tiny real call and returns `test.openrouter.ok: true` when OpenRouter responds. If `ok` is `false`, the `status`/`error` fields explain why (e.g. invalid key `401`, unknown model `404`) so you can fix the key or override `OPENROUTER_MODEL_*`.

---

## Project structure

```
tenun-mock/
├── app/                              # Next.js App Router
│   ├── api/                          # Server-side API routes (no keys reach the client)
│   │   ├── job-intent/route.ts       #   Career search — query → 6 role suggestions
│   │   ├── job-detail/route.ts       #   Deep breakdown for a single role
│   │   ├── parse-resume/route.ts     #   CV → structured profile
│   │   ├── extract-text/route.ts     #   PDF/DOCX → plain text
│   │   ├── site-guide/route.ts       #   Tenun Guide chatbot (controlled KB)
│   │   └── employer-intake/route.ts  #   Employer role-submission capture
│   ├── auth/callback/route.ts        # Supabase OAuth callback
│   ├── dashboard/                    # Authenticated "career weave" + CV builder
│   ├── employers/                    # Employer-facing landing page
│   ├── jobs/[slug]/page.tsx          # Job detail page (calls /api/job-detail)
│   ├── companies/[slug]/page.tsx     # Partner company pages
│   ├── profile/, login/, signup/     # Profile form + auth pages
│   ├── layout.tsx                    # Root layout: providers + Tenun Guide widget
│   └── page.tsx                      # Landing page (Weaver search)
│
├── components/
│   ├── i18n/LanguageProvider.tsx     # Language context (en/ms) + persistence
│   ├── site-guide/TenunGuideWidget.tsx  # Floating mascot chatbot UI
│   ├── landing/                      # Hero, ThreeSteps, Partners, Features, CVSupport, FAQ
│   ├── employers/                    # Hero, Steps, CandidateSignal, Comparison, Form, FAQ …
│   ├── dashboard/                    # DashboardShell + panes (Profile/Paths/Skills/Opportunities/CV) + Atlas/Mentor/Outreach
│   ├── cv/                           # CV templates (Harvard/Creative) + block editor
│   ├── providers/                    # Redux + Auth providers
│   ├── ui/                           # Reusable primitives (button, card, badge, tabs…)
│   ├── navbar.tsx / footer.tsx       # Shared chrome (navbar hosts the language switcher)
│   └── …
│
├── lib/
│   ├── llm.ts                        # OpenRouter→Groq fallback helper (the AI core)
│   ├── i18n.ts                       # en/ms translation dictionary + helpers
│   ├── site-guide-knowledge.ts       # Controlled knowledge base for the chatbot
│   ├── rate-limit.ts                 # Per-route Upstash rate limiting
│   ├── types.ts                      # Shared TypeScript types
│   ├── supabase/                     # Browser + server Supabase clients
│   ├── data/company-jobs.ts          # Partner company + job seed data
│   ├── *-engine.ts / *-data.ts       # Deterministic scoring engines + seed data
│   │                                 #   (career, atlas, mentor, course, outreach)
│   ├── resume-parser.ts, file-extractors.ts  # CV parsing helpers
│   └── utils.ts                      # cn(), scoring helpers
│
├── store/                            # Redux Toolkit
│   ├── index.ts                      # Store config (auth, dashboard, cv slices)
│   ├── slices/                       # authSlice, dashboardSlice, cvSlice
│   └── middleware/autosave.ts        # Autosaves CV/dashboard state
│
├── supabase/migrations/              # SQL schema + row-level security
├── middleware.ts                     # Protects /dashboard, refreshes Supabase session
├── public/images/                    # Logos, mascots, landing art
└── tailwind.config.ts, tsconfig.json, next.config.js
```

---

## Architecture

### AI layer (`lib/llm.ts`)
A single helper, `generateJSONWithFallback()`, powers every AI feature:

1. **OpenRouter first** — calls the configured model, requests strict JSON output, times out after 30s.
2. **Groq fallback** — on any OpenRouter error (HTTP 429/402/5xx, timeout, invalid JSON) or if no OpenRouter key is set.
3. **Throws only if both fail.** Keys are read from `process.env` **server‑side only** — they never reach the browser.

Each route passes a `routeName` so the helper can pick the right per‑route model env var. Output is validated with `isJsonParseable()` before being accepted.

### Authentication (`middleware.ts` + `lib/supabase/*`)
- Supabase handles Google OAuth. `middleware.ts` refreshes the session on every request and **redirects unauthenticated users away from `/dashboard`**.
- If Supabase env vars are missing, `createClient()` returns `null` and middleware passes through — auth simply becomes a no‑op so the rest of the app still works.

### State management (`store/`)
- Redux Toolkit with three slices: **auth**, **dashboard**, and **cv**.
- An **autosave middleware** persists CV/dashboard edits.
- Provided app‑wide via `components/providers/ReduxProvider.tsx`.

### Deterministic engines (`lib/*-engine.ts`)
The dashboard's analysis (career threads, pathways, skill gaps, atlas hubs, mentor/course matches, outreach drafts) is produced by **deterministic scoring engines** over seed data — fast, free, and reproducible. They use careful, non‑predictive language ("appears suitable", "based on your current profile").

### AI vs deterministic boundary (the personalization layer)

> **Tenun uses AI for personalized explanations, career search, CV assistance, mock interviews, and communication drafting. Factual marketplace records such as opportunities, mentors, courses, and atlas locations remain structured data to reduce hallucination risk.**

The product principle is simple: **structured data for truth, AI for explanation, personalization, prioritization and writing.** AI never invents factual records.

**AI‑generated (explanation / drafting only):**
- Career search & job detail (`/api/job-intent`, `/api/job-detail`)
- Resume parsing & CV generation/assistant (`/api/parse-resume`, `/api/generate-cv`, `/api/cv-assistant`)
- Mock interview (`/api/mock-interview`)
- Tenun Guide — grounded strictly in `lib/site-guide-knowledge.ts` (`/api/site-guide`)
- **Dashboard personalization layer (new):**
  - `/api/personalize-dashboard-summary` — Summary tab narrative, why‑this‑archetype, strengths/risks, recommended‑path explanation, 30‑day plan, confidence note.
  - `/api/personalize-pathway` — on‑demand "why it fits / what's hard / test in 30 days" for the **expanded** path only (not all five on load).
  - `/api/personalize-skill-gaps` — one short explanation per skill gap (why it matters / what to build / urgency). **Course names and links stay curated** in `lib/course-data.ts`.
  - `/api/personalize-outreach` — drafts/improves outreach messages, grounded in profile + path + role + skill gaps + resume text. Never fabricates achievements; phrases missing experience honestly.

  All four are thin wrappers over `generateJSONWithFallback()` and append the shared **grounding rules** + locale directive from `lib/ai-prompt.ts`. Client fetchers, response types, and the sessionStorage cache live in `lib/personalization.ts`; the `DashboardPersonalizationProvider` (`components/dashboard/personalization-context.tsx`) fetches the summary once and lazily fetches pathway/skill‑gap explanations.

**Intentionally deterministic / seeded (the source of truth — never AI‑invented):**
- Career archetypes, the five pathway templates, required skills, roles, risks, timelines, trade‑offs (`lib/career-engine.ts`)
- Opportunity listings, mentor profiles, atlas/career‑hub records, course/resource catalog, employer candidate data, salary ranges, application links, company/school names (the `lib/*-data.ts` seed files)

**Fallback behavior.** Every AI personalization call returns `null` on failure (missing keys, rate‑limit, timeout, bad JSON). When that happens the dashboard renders the **deterministic** archetype, growth areas, pathway data, and curated courses exactly as before — the AI layer simply doesn't appear. The page never blocks on or crashes from an AI failure, and the summary is cached in `sessionStorage` (keyed by a profile/target‑job/locale fingerprint) so switching tabs doesn't re‑call the model.

### Rate limiting (`lib/rate-limit.ts`)
Per‑route sliding‑window limits keyed by client IP (e.g. `site-guide`: 20/min, `parse-resume`: 5/min). Backed by Upstash Redis; **automatically disabled** when Upstash env vars are absent (dev‑friendly).

### Internationalization (`lib/i18n.ts` + `components/i18n/LanguageProvider.tsx`)
A lightweight, dependency‑free system — see [Internationalization](#internationalization-i18n) below.

---

## Key user flows

**Career search (home).** `app/page.tsx` → `POST /api/job-intent` `{ query, locale }` → 6 suggestions rendered as cards → clicking a card stores the suggestion in `sessionStorage` and routes to `/jobs/[slug]`.

**Job detail.** `app/jobs/[slug]/page.tsx` reads the suggestion from `sessionStorage`, then `POST /api/job-detail` `{ title, context, locale }` for the skills / secret‑sauce / fit / gaps breakdown.

**CV upload & parse.** Profile/upload page → `POST /api/extract-text` (PDF/DOCX → text) → `POST /api/parse-resume` (text → structured profile) → pre‑fills the profile/CV builder.

**Tenun Guide.** The floating widget (`components/site-guide/TenunGuideWidget.tsx`) → `POST /api/site-guide` `{ message, history, locale, pageContext }`, answered strictly from `lib/site-guide-knowledge.ts`.

---

## API routes

All routes are POST, server‑side, rate‑limited by IP, and return JSON. They never expose API keys.

| Route | Body | Returns |
|---|---|---|
| `/api/job-intent` | `{ query, locale?, skills?, interests?, experience? }` | `{ overview, didYouMean[], suggestions[] }` |
| `/api/job-detail` | `{ title, context?, locale? }` | `{ skills_required[], skills_nice_to_have[], secret_sauce, fit_questions[], common_gaps[], how_to_get_there, entry_paths[] }` |
| `/api/parse-resume` | `{ text }` | Structured profile fields |
| `/api/extract-text` | file upload | `{ text }` |
| `/api/site-guide` | `{ message, history?, locale?, pageContext? }` | `{ answer, confidence, suggestedActions[], shouldEscalate, escalationMessage? }` |
| `/api/employer-intake` | role + contact fields | capture confirmation |

For `locale: "ms"`, the AI writes user‑facing **values** in natural Malaysian Malay while keeping JSON keys and technical terms (SQL, Python, React…) unchanged.

---

## Internationalization (i18n)

Tenun ships with **English (`en`)** and **Bahasa Melayu (`ms`)** — friendly Malaysian Malay, not Indonesian.

**How it works**
- `lib/i18n.ts` exports a typed dictionary. The `en` tree is the source of truth; `ms` must mirror it exactly (TypeScript enforces this at build time).
- `components/i18n/LanguageProvider.tsx` holds the active locale, persists it to `localStorage`, syncs `<html lang>`, and exposes `useLanguage()` → `{ locale, setLocale, t, dict }`.
- The navbar (`components/navbar.tsx`) has the switcher (desktop dropdown + mobile toggle). Switching is instant — no page reload — and persists across refreshes. Default is English.

**Use it in a component**
```tsx
import { useLanguage } from "@/components/i18n/LanguageProvider";

function Example() {
  const { dict, t, locale } = useLanguage();
  return <h1>{dict.home.heroTitleLine3}</h1>;   // or t("home.explore")
}
```

**Add a new string:** add the key under the right section in **both** `en` and `ms` in `lib/i18n.ts` (the build fails if `ms` is missing a key), then reference it via `dict.section.key`.

**Make AI replies localized:** send `locale` in the request body — the route appends a Malay instruction to the system prompt when `locale === "ms"`.

---

## Tenun Guide chatbot

A floating mascot widget that helps users figure out where to go next, **without hallucinating**:

- Answers **only** from the controlled knowledge base in `lib/site-guide-knowledge.ts` plus the current page context.
- Suggested action links are filtered against an **allow‑list of hrefs** — it can never link to an invented page.
- When unsure, it sets `shouldEscalate` and redirects to `NEXT_PUBLIC_TENUN_SUPPORT_EMAIL`.
- **Page‑aware** (different greeting + quick‑action chips per route) and **bilingual**.
- The mascot image lives at `public/images/tenun-mascot.png`, animated with Framer Motion, with a graceful "T" badge fallback if the asset is missing.

---

## Deployment

The app deploys cleanly to **[Vercel](https://vercel.com/)**:

1. Import the repo into Vercel.
2. Under **Project → Settings → Environment Variables**, add the variables from the [Environment variables](#environment-variables) section (for Production and Preview). At minimum, set `OPENROUTER_API_KEY`; set `OPENROUTER_SITE_URL` to your production domain.
3. Deploy. Next.js is auto‑detected; no extra build config needed.

If you use Supabase auth, add `http://localhost:3000/auth/callback` and your production callback URL under **Supabase → Authentication → URL Configuration → Redirect URLs**, and enable the Google provider.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (http://localhost:3000) |
| `npm run build` | Production build (also type‑checks the whole project) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run test:smoke` | Run the Playwright smoke tests (`tests/smoke`) |
| `npm run test:e2e` | Run all Playwright tests |

---

## Testing & demo personas

### Demo personas

Tenun ships a small set of **deterministic demo personas** so the dashboard can be explored (and tested) without onboarding, login, or any AI/Supabase setup. Open any of them at:

```
/dashboard?demo=<persona>
```

| URL | Persona | Good for testing |
|---|---|---|
| `/dashboard?demo=true` | Generalist (default, legacy) | Summary, Career Discovery, Paths |
| `/dashboard?demo=generalist` | Generalist | Broad skills, unclear target role |
| `/dashboard?demo=technologist` | Technologist | Skills, Paths, CV, Mock Interview |
| `/dashboard?demo=creative` | Creative Designer | CV / Portfolio, creative paths |
| `/dashboard?demo=builder` | Builder / Startup | Startup path, Outreach, Opportunities |
| `/dashboard?demo=climate` | Purpose‑driven / Climate | Atlas, Mentors, Opportunities |
| `/dashboard?demo=university` | University Student | Universities tab, internships |
| `/dashboard?demo=minimal` | Low‑information user | Fallbacks / empty states |

When a `demo` param is present the dashboard renders directly (no AuthGate), uses the deterministic career engine, and shows a small **demo persona switcher** (bottom‑left) for hopping between personas. Personas live in [`lib/demo-profiles.ts`](lib/demo-profiles.ts) (`demoProfiles`, `demoProfileOptions`, `getDemoProfile()`); the original `demoProfile` is preserved as the generalist for backward compatibility.

These personas are useful for QA and live demos — every section is exercisable, including the minimal user that proves the dashboard doesn't crash on sparse profiles.

### Smoke tests (Playwright)

Lightweight end‑to‑end smoke tests live in [`tests/smoke/`](tests/smoke/). They confirm the app loads and core flows don't crash — they **do not** require an OpenRouter/Groq key, Supabase, Google login, or any real AI response (dashboard tests use demo personas and assert stable UI labels, never AI‑generated text).

First time only, install the browser binary:

```bash
npx playwright install chromium
```

Then:

```bash
npm run build      # production build + type-check
npm run lint       # ESLint
npm run test:smoke # Playwright smoke tests
```

The Playwright config ([`playwright.config.ts`](playwright.config.ts)) boots the app with `npm run dev` on `http://127.0.0.1:3000` and reuses an already‑running server. Coverage: landing page, every dashboard tab (incl. **Universities**), all demo personas, a 390‑px mobile run that checks for horizontal overflow, the employer landing + candidate dashboard, the profile wizard, and the `/dashboard/cv/new` builder entry.

---

Copyright © Tenun. All rights reserved. Built with [TalentBank](https://www.talentbank.com.my/), Malaysia's talent placement network.
