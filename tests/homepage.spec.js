import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Mark/);
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Scoped to the header nav so these assert the navigation specifically,
    // not any link to the same destination elsewhere on the page.
    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.locator('a[href="/"]').first()).toBeVisible();
    await expect(nav.locator('a[href="/blog"]')).toBeVisible();
    await expect(nav.locator('a[href="/archive"]')).toBeVisible();
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('navigation', { name: 'Main navigation' }).locator('a[href="/blog"]').click();
    await expect(page).toHaveURL(/.*\/blog/);
  });
});