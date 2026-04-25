# Meta Compartilhada — Financial Goal Tracker

## Overview
A full-stack financial goal tracking web application for couples or individuals to manage shared savings and loans. Supports Pix payment integration via Mercado Pago and tracks contribution progress with charts.

## Architecture
- **Frontend:** React 19 + Vite 6, TypeScript, Tailwind CSS 4, Recharts, Framer Motion, shadcn/ui
- **Backend:** Express (Node.js) with Vite in middleware mode — single unified server
- **Database:** MongoDB via Mongoose (optional; app warns if not configured)
- **Payment:** Mercado Pago SDK for Pix QR code generation (mock mode if token is `test_dummy`)

## Project Structure
- `server.ts` — Express backend + Vite dev middleware; all API routes under `/api/`
- `src/` — React frontend (App.tsx, components/)
- `components/ui/` — shadcn/ui reusable components
- `lib/utils.ts` — Utility functions
- `vite.config.ts` — Vite configuration
- `index.html` — SPA entry point

## Running the App
The single `npm run dev` command starts both the Express API and the Vite dev server (embedded as middleware) on port 5000.

## Environment Variables
- `MONGODB_URI` — MongoDB connection string (required for data persistence)
- `MERCADOPAGO_ACCESS_TOKEN` — Mercado Pago token (defaults to `test_dummy` for mock mode)
- `GEMINI_API_KEY` — Google Gemini API key

## GitHub Auto-Sync
Every `git commit` automatically pushes to [acaciogalvao/Meta_Compartilhada02](https://github.com/acaciogalvao/Meta_Compartilhada02) via a post-commit git hook.

- **Hook:** `.git/hooks/post-commit` — runs `git push --force origin <branch>` after each commit
- **Credential helper:** `github-credential-helper.sh` — reads `GITHUB_PAT` secret at push time
- **Setup script:** `github-sync-setup.sh` — re-run to reinstall the hook if needed
- **Required secret:** `GITHUB_PAT` (already configured in Replit Secrets)

## Configuration Notes
- Server port: **5000** (changed from original 3000)
- Vite dev server: `host: 0.0.0.0`, `allowedHosts: true` for Replit proxy compatibility
- Production build: `npm run build` outputs to `dist/`, served statically by Express
