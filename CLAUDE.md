# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **China Government Debt Tracker** (中国政府债务追踪平台), an internal research website for academic fiscal research teams. It aggregates authoritative articles, policies, data pages, and archives monthly/historical briefs. The system stores only metadata and AI‑generated brief content, not full‑text articles.

## Common Commands

```bash
# Development
npm run dev          # Start Next.js dev server at http://localhost:3000
npm run api          # Start local API server at http://localhost:4010
npm run lint         # Type‑check with tsc (no‑emit)

# Build & Deployment
npm run build        # Next.js production build
npm run start        # Start production server (after build)

# Data Updates & Brief Generation
npm run update:monthly [--month=YYYY-MM]   # Generate monthly brief for target month (default: previous month)
npm run update:weekly                      # Generate weekly report
npm run fetch:celma                        # Update CELMA annual issuance dataset
npm run import:url <URL> <category>        # Manually import a URL (category: policy/debt/news/paper)

# Other Scripts
npm run fetch:celma-policy                 # Update CELMA policy dynamics dataset
```

## Architecture

### Frontend (Next.js 15, App Router)
- `/app` – page routes (`/`, `/data`, `/policies`, `/news`, `/papers`, `/sources`, `/updates`, `/debt`, `/briefs`)
- `/components` – reusable UI components (charts, filters, layout, lists, pages, ui)
- `/lib` – data access (`data.ts`), types (`types.ts`), utilities (`utils.ts`)
- Styles: Tailwind CSS with custom CSS in `app/globals.css`

### Data Layer
- **Primary data store**: `data/bundle.json` – contains `policies`, `debt`, `news`, `papers`, `updates`, `highlights`, `observation`, `metadata`
- **Source catalog**: `data/source‑catalog.json` – defines automatic/manual/navigation‑only sources with fallback records
- **Brief archive**: `data/reports.json` – monthly briefs (`MonthlyBrief[]`)
- **Weekly reports**: `data/weekly‑reports.json` – weekly bond issuance summaries
- **Incremental index**: `data/crawl‑index.json` – deduplication key‑based index
- **External datasets**: CELMA annual issuance/balance, CELMA policy dynamics, CELMA bond issuance, Chinabond issuance (all JSON)

### Update Pipeline (`scripts/update.mjs`)
1. Reads `source‑catalog.json` and filters by target month.
2. For each source with `automation: "auto"`, attempts to scrape HTML; otherwise uses fallback records.
3. Merges new records into `bundle.json` using `crawl‑index.json` for deduplication.
4. Builds a monthly brief (`MonthlyBrief`) with sections for policy, data, news, papers, and analysis.
5. If `LLM_API_KEY` environment variable is set, enhances brief with LLM; otherwise uses rule‑based summaries.
6. Updates `reports.json` and `bundle.json` metadata.

### Local API (`server/api.mjs`)
Provides read‑only endpoints for frontend and external consumption:
- `GET /api/health`
- `GET /api/sources` (optional `?category=policy|debt|news|paper`)
- `GET /api/briefs` and `/api/briefs/YYYY‑MM`
- `GET /api/records?category=…&month=YYYY‑MM`
- `GET /api/dashboard`

The API reads JSON files directly from the `data/` directory.

## Key Data Structures (see `lib/types.ts`)

- `PolicyItem`, `DebtDataItem`, `NewsItem`, `PaperItem`, `UpdateLogItem`
- `SourceCatalogItem` – defines a source’s category, authority, cadence, method, URL, selectors, fallback records
- `MonthlyBrief` – `month`, `title`, `generatedAt`, `mode`, `sourceCounts`, `sections`, `relatedIds`, `relatedLinks`
- `WeeklyReport` – `weekStart`, `weekEnd`, `title`, `totalBonds`, `totalAmount`, `regions`, `docxPath`, `pdfPath`

## Environment Variables

See `.env.example` for available options:

- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` – optional, used to enhance monthly briefs with LLM‑generated content. If not set, rule‑based summaries are used.
- `PORT` – local API server port (default: 4010).
- `FETCH_TIMEOUT_MS` – timeout for fetching external URLs (default: 15000 ms).

Copy `.env.example` to `.env.local` and fill in values as needed.

## Building for Static Export (GitHub Pages)

The Next.js app can be statically exported for GitHub Pages (frontend pages and JSON files are exported). The local API is not available in static deployment; consider moving the API to a separate Node process for cloud deployment.

GitHub Actions workflows (`.github/workflows/`) automate building and deploying to GitHub Pages:
- `build.yml` – runs `npm run build:pages` on pushes to `copilot/**` branches and pull requests to `main`.
- `deploy-pages.yml` – builds and deploys the `out` directory to GitHub Pages on pushes to `main`.

The `build:pages` script is an alias for `next build` (static export).

## Important Notes

- The system is designed for **internal research use**; it does not store full‑text articles, only metadata and generated briefs.
- Source fallback records are used when automatic scraping fails or is disabled (`navigationOnly: true`, `automation: "manual‑only"`).
- Weekly reports are generated by an external Python script (`scripts/report_generation/generate_weekly_report.py`) and stored as `.docx`/`.pdf` files; the JSON metadata references those file paths.
- Scripts are organized into subfolders: `scripts/data_management/` (data collection, download, extraction, merging), `scripts/report_generation/` (weekly report), `scripts/website_management/` (fiscal link diagnosis). Core orchestration scripts (`update.mjs`, `import‑url.mjs`) remain in `scripts/` root.
