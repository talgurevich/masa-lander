# מסע אל האופק — Landing Page

A Next.js 15 / React 19 landing page for the מסע אל האופק post-army youth program. Hebrew RTL, mobile-first.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

Push to GitHub, then import the repo at [vercel.com/new](https://vercel.com/new). Vercel auto-detects Next.js — no config needed.

## Form submissions

The registration form currently shows a success state client-side but does not POST anywhere. To wire it to a real backend, either:

- Add a Next.js route handler at `app/api/register/route.ts` and POST from the form
- Or use a hosted form service (Formspree, Getform) and update the form `action`

## Assets

- `public/hero.avif` — hero background photo
- `public/logo.avif` — brand logo (used in header + footer)
