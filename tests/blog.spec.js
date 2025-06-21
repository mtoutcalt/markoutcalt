import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should load blog index page', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('.page-intro-quote')).toBeVisible();
  });

  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');
    
    const blogPosts = page.locator('.hero-post-card, .post-card');
    await expect(blogPosts.first()).toBeVisible();
  });

  test('should navigate to individual blog post', async ({ page }) => {
    await page.goto('/blog');
    
    const firstPost = page.locator('.hero-post-card, .post-card').first();
    await expect(firstPost).toBeVisible();
    await firstPost.click();
    
    await expect(page.locator('main')).toBeVisible();
  });
});