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

## Pages

| Route | Purpose | Storage |
| --- | --- | --- |
| `/lander1` | Public program landing page + registration | Monday.com board |
| `/leader-feedback` | Private feedback survey, link sent to specific people | Google Sheet |

## Form submissions

**`/lander1`** posts to `app/api/register/route.ts`, which creates an item on a
Monday.com board. Needs `MONDAY_API_TOKEN` and `MONDAY_BOARD_ID`.

**`/leader-feedback`** posts to `app/api/leader-feedback/route.ts`, which appends
one row per response to a Google Sheet. The questions live in
`lib/feedback-questions.ts` — that one file drives the rendered form, the
server-side validation, and the sheet's header row, so changing the survey means
editing only it.

### Google Sheets setup

1. Create a spreadsheet. Copy its ID from the URL:
   `docs.google.com/spreadsheets/d/`**`<THIS PART>`**`/edit`
2. In [Google Cloud Console](https://console.cloud.google.com/), create (or pick)
   a project and enable the **Google Sheets API**.
3. Create a **service account**, then under its Keys tab add a **JSON** key and
   download it.
4. **Share the spreadsheet with the service account's email address**
   (`something@project.iam.gserviceaccount.com`) as an **Editor**. This step is the
   one people forget — without it every write returns 403.
5. Set these env vars locally in `.env.local` and in the Vercel project settings:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@yyy.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
FEEDBACK_SHEET_ID=<spreadsheet id from step 1>
FEEDBACK_SHEET_TAB=        # optional; leave unset to use the first tab
```

`GOOGLE_PRIVATE_KEY` is the `private_key` field from the downloaded JSON, quoted,
with its `\n` escapes left as-is — the code unescapes them.

The header row is written automatically on the first submission if the sheet is
empty. Check `GET /api/leader-feedback` to confirm the server sees its config.

## Assets

- `public/hero.avif` — hero background photo
- `public/logo.avif` — brand logo (used in header + footer)
