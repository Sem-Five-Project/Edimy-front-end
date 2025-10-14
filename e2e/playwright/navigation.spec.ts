import { test, expect } from '@playwright/test';

test('homepage navigation buttons route to login/register', async ({ page }) => {
  await page.goto('/');

  // Click 'Get Started' and assert we land on /register
  const getStarted = page.getByRole('button', { name: /get started|start learning today/i });
  await expect(getStarted).toBeVisible();
  await getStarted.click();
  await expect(page).toHaveURL(/\/register/);

  // Go back, click 'Sign In' and assert we land on /login
  await page.goBack();
  const signIn = page.getByRole('button', { name: /sign in|login/i });
  await expect(signIn).toBeVisible();
  await signIn.click();
  await expect(page).toHaveURL(/\/login/);
});
