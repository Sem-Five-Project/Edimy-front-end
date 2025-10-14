import { test, expect } from '@playwright/test';

test('register page loads and shows registration form', async ({ page }) => {
  await page.goto('/register');

  const heading = page.getByRole('heading', { name: /register|get started|sign up/i });
  await expect(heading).toBeVisible({ timeout: 5000 });

  await expect(page.getByLabel(/name/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});
