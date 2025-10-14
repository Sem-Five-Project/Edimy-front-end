# Playwright E2E test

Quick steps to run the Playwright end-to-end test locally.

1. Install dependencies (adds Playwright):

```powershell
npm install
npx playwright install
```

2. Start the dev server in one terminal:

```powershell
npm run dev
```

3. Run the Playwright tests in another terminal:

```powershell
npm run test:e2e
```

Notes:
- The test uses `baseURL` from `E2E_BASE_URL` environment variable or defaults to `http://localhost:3000`.
- Tests are placed under `e2e/playwright` and the example spec checks the homepage heading 'Welcome to Edimy'.
