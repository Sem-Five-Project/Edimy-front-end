import { test, expect } from '@playwright/test';

test('homepage shows welcome heading', async ({ page }) => {
  await page.goto('/');

  // Assert the main heading contains 'Welcome to Edimy'
  const heading = page.getByRole('heading', { name: /Welcome to\s+Edimy/i });
  await expect(heading).toBeVisible();
});
