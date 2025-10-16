# Edimy Front-end — User Manual

This document explains how to set up, run, test, and contribute to the Edimy front-end project (a Next.js + React application). It includes environment variables, common scripts, project layout, development tips, and troubleshooting guidance.

## Table of contents
- Overview
- Prerequisites
- Quick start (clone, install, run)
- Environment variables
- NPM scripts
- Running the app (dev / build / start)
- Testing (unit, watch, end-to-end)
- Project structure (high level)
- Common workflows
- Contributing
- Troubleshooting

## Overview

Edimy front-end is a Next.js (React) application with TypeScript. It uses Tailwind CSS for styling, Playwright for end-to-end tests, and Jest for unit tests. Firebase is used for certain features (configuration and messaging).

This repo's package name is `tutor_platform` and the Next.js version is declared in `package.json`.

## Prerequisites

- Node.js (recommend v18+ or the version you normally use with Next.js 15). You can check with `node -v`.
- npm (bundled with Node.js) or an alternative package manager (yarn/pnpm) — this manual uses npm commands.
- Optional: Git to clone the repository.

## Quick start

1. Clone the repository:

   git clone <your-repo-url>
   cd Edimy-front-end

2. Install dependencies:

   npm install

3. Create environment variables (see below) and put them in a `.env.local` file at the project root.

4. Start in development mode:

   npm run dev

Open http://localhost:3000 in your browser (Next.js default) unless the port is changed.

## Environment variables

The project reads Firebase configuration values from environment variables. Create a `.env.local` file at the project root and set the following variables (values come from your Firebase project settings):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- NEXT_PUBLIC_FIREBASE_APP_ID

Example `.env.local` (do NOT commit this to version control):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```

Notes:
- Environment variables are read by `src/lib/firebaseConfig.ts` and used when initializing Firebase.
- Because the variables are prefixed with `NEXT_PUBLIC_`, they will be inlined into the browser bundle by Next.js (this is expected for Firebase client configuration).

## NPM scripts

The following scripts are defined in `package.json`:

- `npm run dev` — start the Next.js development server (uses turbopack): `next dev --turbopack`.
- `npm run build` — build the production optimized app: `next build`.
- `npm run start` — run the built app in production mode: `next start`.
- `npm run lint` — run Next.js linting (`next lint`).
- `npm run test` — run Jest tests once (`jest --passWithNoTests`).
- `npm run test:watch` — run Jest in watch mode.
- `npm run test:e2e` — run Playwright E2E tests (`playwright test`).

Run these from the repository root.

## Running the app

Development

- Start dev server:

  npm run dev

- Hot reload will update pages automatically on save.

Production build

- Create a production build:

  npm run build

- Start the production server (after build):

  npm run start

If you need to serve a static export or host on Vercel/other hosts, follow Next.js deployment guides.

## Testing

Unit & integration (Jest)

- Run tests once:

  npm run test

- Run tests in watch mode while developing:

  npm run test:watch

End-to-end (Playwright)

- Playwright tests live under `e2e/playwright/` and output reports under `playwright-report/`.
- Run E2E tests:

  npm run test:e2e

- Playwright needs browser binaries. If Playwright tests fail due to missing browsers, run:

  npx playwright install

or install via Playwright's installer of your choice.

## Project structure (high level)

Key directories and files (root-level):

- `src/` — application source
  - `app/` — Next.js app directory (routes, layout)
  - `components/` — shared React components
  - `lib/` — libraries and helpers (API wrappers, Firebase config, etc.)
  - `contexts/` — React context providers
  - `hooks/` — custom React hooks
  - `assets/`, `fonts/`, `css/` — static assets and styles

- `public/` — public static files (served at root)
- `e2e/playwright/` — Playwright end-to-end tests
- `playwright-report/` — generated test reports

Important files:

- `package.json` — scripts and dependencies
- `next.config.ts` / `next-env.d.ts` — Next.js config and types
- `tailwind.config.ts` / `postcss.config.mjs` — Tailwind CSS config
- `src/lib/firebaseConfig.ts` — initializes Firebase using env vars

## Common workflows

Switching to development branch / making changes

1. Create a branch: `git checkout -b feat/your-feature`
2. Implement your changes.
3. Run lint and tests locally: `npm run lint && npm run test`.
4. Build to validate: `npm run build`.
5. Open a PR with a clear description and testing steps.

Debugging Firebase issues

- Ensure your `.env.local` has correct NEXT_PUBLIC_* variables.
- Check the browser console for Firebase runtime errors.
- If messaging (service worker) is used, ensure `public/firebase-messaging-sw.js` is present and registered correctly.

Working with Playwright

- Playwright tests are runnable locally and in CI. Playwright's `test` runner will discover tests in the `e2e/playwright` folder.
- To regenerate snapshots or update tests, follow Playwright documentation for `--update-snapshots` or test-specific flags.

## Contributing

- Fork or branch from `main`.
- Keep changes small and focused per PR.
- Write/update tests for new features or bug fixes.
- Run lint and tests before opening a PR.

Code style

- The project uses TypeScript and follows Next.js conventions. Use existing patterns for components, hooks, contexts, and layout.

## Troubleshooting

- Build fails with type errors: run `npm run lint` and `npm run test` to surface TypeScript/Jest issues. Fix the reported errors.
- Dev server won't start: ensure Node version is compatible and no other process uses port 3000.
- Playwright reports missing browsers: run `npx playwright install`.
- Firebase fails to initialize: confirm `.env.local` values and check `src/lib/firebaseConfig.ts` uses the expected NEXT_PUBLIC_* variables.

## Extras / Notes

- The repository includes Playwright reports in `playwright-report/index.html`. Open it in a browser to inspect E2E results.
- Tests in `test-results/` may contain historical or CI-generated snapshots.

---

If you want, I can also:

- Add a `CONTRIBUTING.md` with a PR checklist.
- Add a `make` or `npm` script that bootstraps `.env.local` from a `.env.example` template.
- Generate a minimal README section to include here or replace this manual.

---

Generated on: 2025-10-16
