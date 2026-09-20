# INE Price Tracker — Implementation Plan

Based on your [blueprint](file:///e:/iNE/price-tracker-blueprint.md). Straight to the point — function over form.

## Project Structure

```
e:\iNE\
├── backend/
│   ├── scraper/
│   │   ├── scrapeProduct.js    — Playwright scraper (network interception)
│   │   ├── reliableScrape.js   — Retry wrapper with validation
│   │   ├── search.js           — Plain fetch catalog search
│   │   └── cli.js              — CLI for manual/headed testing
│   ├── routes/
│   │   ├── search.js
│   │   ├── products.js
│   │   └── scrape.js
│   ├── db.js                   — Supabase client
│   ├── server.js               — Express app
│   ├── package.json
│   ├── render.yaml
│   ├── .env.example
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Search.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ProductDetail.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── .env.example
│   └── vite.config.js
├── supabase/
│   ├── schema.sql
│   └── README.md
└── README.md
```

## Execution Order

I'll build these sequentially, each stage producing runnable code:

### Stage 1 — Infra Skeleton
- `supabase/schema.sql` — 3 tables exactly as blueprint specifies
- Minimal Express backend with `/api/health`, CORS, dotenv
- `render.yaml` with Playwright Chromium install step
- Minimal Vite React frontend with health check display

### Stage 2 — Scraper Engine (Core)
- `scrapeProduct.js` — Playwright, navigates to product URL, intercepts `/api/products/*/price` network response, 45s timeout, returns `{price, inStock}`
- `reliableScrape.js` — Up to 3 retries, honors `Retry-After`, validates price is positive finite number + inStock is boolean, returns full attempts array, never throws
- `search.js` — Plain `fetch` to `/api/catalog`, returns product list
- `cli.js` — `node cli.js scrape <url> [--headed]` and `node cli.js search <query>`

### Stage 3 — Backend API
All routes from the blueprint:
- `GET /api/search?q=` → catalog search
- `POST /api/products` → track a product
- `GET /api/products` → list tracked products
- `GET /api/products/:id/history` → price history
- `GET /api/products/:id/logs` → scrape logs
- `POST /api/scrape/:productId` → scrape one product now
- `POST /api/scrape/trigger` → scrape all tracked products sequentially

**Golden rule enforced**: `price_history` row ONLY on validated success. `scrape_log` row on EVERY attempt.

### Stage 4 — Frontend (Clean, simple UI)
- Plain React + React Router with **simple, clean CSS** — looks like a proper app, not raw HTML
- Clean layout, readable fonts, sensible spacing, basic color usage (nothing fancy)
- No CSS frameworks, no design libraries — just a small hand-written `styles.css`
- Search page: text input + button → clean list of results → "Track" button each
- Dashboard: neat list of tracked products with links
- Product detail: one `recharts` line chart + clean price history table + scrape log table
- React Router for page navigation
- Simple navbar/header to navigate between Search and Dashboard

### Stage 5 — Docs
- Top-level `README.md` with setup, architecture, env vars
- `.env.example` files

> [!IMPORTANT]
> **Manual steps you'll need to do yourself** (after I build the code):
> - Create a Supabase project and run `schema.sql` in the SQL editor
> - Push to GitHub and connect to Render (backend) and Vercel (frontend)
> - Set up cron-job.org to POST `/api/scrape/trigger` every 2h
> - Record the headed-mode screen recording
> - Write the design note (blueprint says to do this yourself)

## What I'm NOT doing
- No unnecessary fancy styling (no gradients, animations, glassmorphism, etc.)
- No CSS framework (no Tailwind, no Bootstrap)
- No auth on the trigger endpoint
- No bonus features
- No parallel scraping (sequential with delays as blueprint requires)

## Verification
- Backend: hit `/api/health`, test search, test scrape via CLI
- Frontend: verify all pages load and display data
- Scraper: run CLI in headed mode to confirm retry behavior works
