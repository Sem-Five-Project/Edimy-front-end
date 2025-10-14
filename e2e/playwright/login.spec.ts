import { test, expect } from '@playwright/test';

test('login page loads and shows login form', async ({ page }) => {
  await page.goto('/login');

  // Expect a visible heading or button related to login
  const heading = page.getByRole('heading', { name: /login|sign in/i });
  await expect(heading).toBeVisible({ timeout: 5000 });

  // Check presence of email and password fields
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
