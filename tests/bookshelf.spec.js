import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { books } from '../src/data/books.js';

test.describe('Bookshelf', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/bookshelf/');
  });

  test('puts every book on the shelf', async ({ page }) => {
    await expect(page.locator('.book')).toHaveCount(books.length);
    await expect(page.locator('#bookCount')).toHaveText(`(${books.length})`);
  });

  test('every cover image loads', async ({ page }) => {
    // Hotlinked covers rot silently; covers are self-hosted under public/books/.
    await page.waitForLoadState('networkidle');
    const broken = await page.$$eval('.book-cover', (imgs) =>
      imgs.filter((img) => img.hidden || img.naturalWidth === 0).map((img) => img.getAttribute('src'))
    );
    expect(broken).toEqual([]);
  });

  test('genre filter hides the other books', async ({ page }) => {
    const genre = books[0].genre;
    const expected = books.filter((book) => book.genre === genre).length;

    await page.selectOption('#genreFilter', genre);

    await expect(page.locator('.shelf-item:not(.shelf-decor):visible')).toHaveCount(expected);
    await expect(page.locator('#genreLabel')).toHaveText(genre);
    await expect(page.locator('#bookCount')).toHaveText(`(${expected})`);
  });

  test('Random opens a book and Escape hands focus back', async ({ page }) => {
    await page.click('#randomBook');

    const overlay = page.locator('#bookModalOverlay');
    await expect(overlay).toHaveClass(/visible/);
    await expect(page.locator('#modalClose')).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(overlay).not.toHaveClass(/visible/);
    await expect(page.locator('.book:focus')).toHaveCount(1);
  });

  test('should be accessible', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
