import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mark/);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('a[href="/"]').first()).toBeVisible();
    await expect(page.locator('a[href="/blog"]')).toBeVisible();
    await expect(page.locator('a[href="/archive"]')).toBeVisible();
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('a[href="/blog"]');
    await expect(page).toHaveURL(/.*\/blog/);
  });
});