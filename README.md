# Bkard — Premium Digital Business Card & Executive Identity Platform

Bkard is a production-ready React + Vite application for creating, customizing,
sharing and monetizing premium digital business cards, with executive
verification (GST) and professional networking built in.

## Tech Stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18, Vite, React Router DOM v6, Tailwind CSS |
| State      | Context API (Auth, Cards, Premium, Toast) |
| Backend    | Supabase (Postgres + Auth), with localStorage as the offline/fallback data layer |
| Exports    | `qrcode.react` (QR), `html2canvas` + `jspdf` (PNG/PDF), custom vCard generator |
| Deployment | Vercel |

The app is **fully functional without Supabase configured** — every feature
runs on localStorage. Adding Supabase env vars transparently layers on
persistent multi-device sync (see `src/lib/supabaseClient.js`).

## Folder Structure

```
bkard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── vercel.json
├── .env.example
├── supabase/
│   └── schema.sql            # Tables + RLS policies + triggers
└── src/
    ├── main.jsx               # Providers + BrowserRouter mount
    ├── App.jsx                # Root shell
    ├── index.css              # Tailwind entry + base styles
    ├── router/
    │   └── AppRouter.jsx      # All routes
    ├── context/
    │   ├── AuthContext.jsx
    │   ├── CardContext.jsx
    │   ├── PremiumContext.jsx
    │   └── ToastContext.jsx
    ├── hooks/
    │   ├── useAuth.js
    │   ├── useCards.js
    │   ├── usePremium.js
    │   ├── useToast.js
    │   └── useLocalStorage.js
    ├── lib/
    │   ├── constants.js       # STATE KEYS, templates, brand colors
    │   ├── storage.js         # localStorage helpers
    │   ├── supabaseClient.js
    │   ├── vcard.js           # vCard build + download
    │   ├── exportImage.js     # PNG export (html2canvas)
    │   ├── exportPdf.js       # PDF export (jspdf)
    │   └── downloadManager.js # Free-tier / premium download gating
    ├── components/
    │   ├── common/            # Button, Input, Card, Modal, Toast,
    │   │                       LoadingScreens, ProtectedRoute, PremiumBanner
    │   ├── layout/             # Navbar, Sidebar, DashboardLayout
    │   └── cards/               # QRGenerator, BusinessCard, ProfileCard,
    │                             TemplateSelector
    └── pages/
        ├── onboarding/          # Exclusivity, Cards, Verification
        ├── auth/                 # Login (signup toggle), GstVerification
        ├── create/                # Create (redirect), Details, Templates
        ├── Dashboard.jsx
        ├── Cards.jsx
        ├── CardShare.jsx          # Public /cards/share/:id
        ├── Payment.jsx
        ├── Settings.jsx
        └── NotFound.jsx
```

## Routes

| Path | Access | Description |
|------|--------|--------------|
| `/onboarding/exclusivity` | Public | Step 1 — brand intro |
| `/onboarding/cards` | Public | Step 2 — template showcase |
| `/onboarding/verification` | Public | Step 3 — verification pitch |
| `/auth/login` | Public | Login / signup toggle |
| `/auth/gst-verification` | Protected | GSTIN verification for exec badge |
| `/dashboard` | Protected | Stats, premium banner, recent cards |
| `/create` | Protected | Redirects to `/create/details` |
| `/create/details` | Protected | Card detail form (step 1/2) |
| `/create/templates` | Protected | Template picker + live preview (step 2/2) |
| `/cards` | Protected | Full card list with delete |
| `/cards/share/:id` | **Public** | Shareable card, QR, exports, connect |
| `/payment` | Protected | Plan selection + simulated checkout |
| `/settings` | Protected | Profile / Company / Security / Billing tabs |

## State Keys (localStorage)

```js
bkard_user            // current user record
bkard_gst_verified     // boolean — executive verification status
bkard_cards            // array of created business cards
bkard_download_count   // integer — cumulative free-tier downloads
bkard_is_premium       // boolean — premium subscription status
```

## Core Feature Logic

- **Auth** (`AuthContext`): signup/login/logout with Supabase when
  configured, else a lightweight localStorage session. Session restore
  runs on mount via `supabase.auth.getSession()`.
- **GST Verification** (`verifyGst`): validates GSTIN shape
  (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$`) and unlocks the
  executive badge shown on `Dashboard` and public card pages.
- **Card creation**: two-step wizard (`Details` → `Templates`) backed by a
  `bkard_card_draft` scratch key, finalized via `CardContext.createCard`.
- **QR generation**: `QRGenerator` encodes `${origin}/cards/share/:id` and
  offers a high-res PNG download of the QR itself.
- **Exports**: PNG/PDF render the exact `BusinessCard` DOM node via
  `html2canvas`; vCard is generated as a `.vcf` blob — all gated through
  `downloadManager` / `PremiumContext`.
- **Download limits**: `FREE_DOWNLOAD_LIMIT = 15`. Every export call
  `registerDownload()`s first; once exhausted, a paywall `Modal` appears
  and routes to `/payment`.
- **Payment**: simulated checkout (`Payment.jsx`) that calls
  `upgradeToPremium()`, flipping `bkard_is_premium` to `true` and removing
  all download caps immediately.
- **Networking**: the `Connect` button on `CardShare` increments the
  card's `connections` counter (and inserts into `connections` in
  Supabase, gated by RLS, when configured).

## Getting Started

```bash
npm install
cp .env.example .env      # optional — app works without this
npm run dev
```

## Supabase Setup (optional but recommended for production)

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the contents of `supabase/schema.sql` → Run.
   This creates `profiles`, `cards`, `connections`, `downloads`,
   `subscriptions`, all RLS policies, and a trigger that auto-provisions a
   `profiles` row on signup.
3. Copy your **Project URL** and **anon public key** into `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
4. Restart `npm run dev` — the app now persists through Supabase in
   addition to localStorage.

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In Vercel: **New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). Build command
   `npm run build`, output directory `dist` (both auto-filled).
4. Add environment variables in **Project Settings → Environment
   Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. `vercel.json` already includes the SPA rewrite rule so deep
   links like `/cards/share/abc-123` resolve correctly on refresh.

## Design System

- **Primary** `#3A86FF` · **Accent** `#FFBE0B` · **Dark** `#1A1A1A` ·
  **Background** `#F7F7F7`
- **Typeface**: Inter (400–900), loaded via Google Fonts in `index.html`.
- Fully responsive: mobile bottom nav, tablet-friendly grids, desktop
  sidebar — see `DashboardLayout.jsx`.
- Motion: subtle `fade-in` / `slide-up` / `scale-in` keyframes defined in
  `tailwind.config.js` for an Apple-level, unobtrusive feel.

## Notes on Production Hardening

- Replace the simulated `Payment.jsx` checkout with a real processor
  (Stripe Checkout/Elements) — the UI and premium-unlock hook
  (`upgradeToPremium`) are already wired for a drop-in swap.
- GST verification currently checks GSTIN shape only; wire
  `AuthContext.verifyGst` to a real GST validation API (e.g. via a
  Supabase Edge Function) for production compliance.
- Add a Supabase Storage bucket + policy if you want to support real
  avatar image uploads (`card.avatarUrl` is already modeled).
