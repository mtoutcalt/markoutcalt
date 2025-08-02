import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should be accessible', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('blog page should be accessible', async ({ page }) => {
    await page.goto('/blog');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('navigation should be keyboard accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test that navigation links are keyboard accessible
    const navLinks = page.locator('nav a:visible, nav button:visible');
    const count = await navLinks.count();
    
    // Should have at least some navigation elements
    expect(count).toBeGreaterThan(0);
    
    // Test that each navigation element can receive focus
    for (let i = 0; i < Math.min(count, 5); i++) { // Test first 5 elements
      const element = navLinks.nth(i);
      await element.focus();
      
      // Check that element is focused
      const isFocused = await element.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });

  test('mobile menu should be accessible', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Find the hamburger menu button
    const hamburgerButton = page.locator('#hamburger-menu');
    await expect(hamburgerButton).toBeVisible();
    
    // Check ARIA attributes
    await expect(hamburgerButton).toHaveAttribute('aria-label', 'Menu');
    
    // Open the menu
    await hamburgerButton.click();
    
    // Check that menu is expanded
    await expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
    
    // Check that nav links are visible
    const navLinks = page.locator('#nav-links');
    await expect(navLinks).toHaveAttribute('aria-hidden', 'false');
    
    // Run accessibility scan with mobile menu open
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('focus management should work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Find a focusable element and test it
    const firstFocusable = page.locator('a, button, input, select, textarea').first();
    await firstFocusable.focus();
    
    // Check that element is actually focused
    const isFocused = await firstFocusable.evaluate(el => el === document.activeElement);
    expect(isFocused).toBeTruthy();
    
    // Check that it's visible (basic focus management)
    await expect(firstFocusable).toBeVisible();
  });

  test('color contrast should meet WCAG standards', async ({ page }) => {
    await page.goto('/');
    
    // Run axe specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});