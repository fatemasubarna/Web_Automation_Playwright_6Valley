import { expect, test } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { BASE_URL } from '../src/utils/env';

test.describe('Search Page Tests', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigateTo(BASE_URL);
  });

  test('Search via button click triggers results', async () => {
    const searchTerm = 'phone';

    await searchPage.search(searchTerm, { trigger: 'button' });

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);

    const firstProductName = (await searchPage.getFirstProductName()).toLowerCase();
    expect(firstProductName).toContain(searchTerm);
  });

  test('Search trims extra spaces and still returns results', async () => {
    const searchTerm = 'phone';
    await searchPage.search(`   ${searchTerm}   `, { trigger: 'button' });

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('Search for a non-existing product shows empty state (or no results)', async () => {
    const searchTerm = 'zzzz_no_such_product_12345';
    await searchPage.search(searchTerm, { trigger: 'button' });

    const resultsCount = await searchPage.getResultsCount();
    if (resultsCount > 0) {
      const firstProductName = (await searchPage.getFirstProductName()).toLowerCase();
      expect(firstProductName).toContain(searchTerm);
      return;
    }

    await searchPage.expectEmptyStateVisible();
  });

  test('Case insensitivity: PHONE / Phone / phone returns same first results', async () => {
    const variants = ['PHONE', 'Phone', 'phone'];
    const topLists: string[][] = [];

    for (const term of variants) {
      await searchPage.search(term, { trigger: 'button' });
      topLists.push((await searchPage.getTopProductNames(5)).map((v) => v.toLowerCase()));
      await searchPage.navigateTo(BASE_URL);
    }

    expect(topLists[0]).toEqual(topLists[1]);
    expect(topLists[1]).toEqual(topLists[2]);
  });

  test('Partial match search: "iph" returns iPhone-like products', async () => {
    await searchPage.search('iph', { trigger: 'button' });
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);

    const first = (await searchPage.getProductNameByIndex(0)).toLowerCase();
    expect(first).toContain('iph');
  });

  test('Special characters handling: "@#$%" does not crash and shows empty state or results', async () => {
    await searchPage.search('@#$%', { trigger: 'button' });
    // Just assert the page reached /products and UI is responsive.
    await expect(searchPage.resultsContainer).toBeVisible();
    await expect(searchPage.page).toHaveURL(/\/products(\?|$)/);
  });

  test('Numeric search: "14" can match products like iPhone 14', async () => {
    await searchPage.search('14', { trigger: 'button' });
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);

    const first = (await searchPage.getProductNameByIndex(0)).toLowerCase();
    expect(first).toMatch(/14/);
  });

  test('Long search input (100+ chars) does not break UI', async () => {
    const longText = 'phone '.repeat(25).trim(); // > 100 chars
    await searchPage.search(longText, { trigger: 'button' });
    await expect(searchPage.resultsContainer).toBeVisible();
    await expect(searchPage.page).toHaveURL(/\/products(\?|$)/);

    const value = await searchPage.getSearchInputValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test('Search via Enter key triggers results', async () => {
    await searchPage.search('phone', { trigger: 'enter' });
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('Empty search submission shows products', async () => {
    await searchPage.search('', { trigger: 'button' });
    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('Search result navigation: clicking a product opens product details page', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);
    await expect(page).toHaveURL(/\/product\//);
  });

  test('Result consistency: searching same keyword twice returns same top results', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    const firstRun = (await searchPage.getTopProductNames(5)).map((v) => v.toLowerCase());

    await searchPage.navigateTo(BASE_URL);
    await searchPage.search('phone', { trigger: 'button' });
    const secondRun = (await searchPage.getTopProductNames(5)).map((v) => v.toLowerCase());

    expect(secondRun).toEqual(firstRun);
  });

  test('Search + sorting (if available): applying sort does not break results', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    const applied = await searchPage.applySortByValue('price_low_to_high');
    if (!applied) test.skip(true, 'Sort dropdown not available on this environment.');

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('Search + filter (if available): applying price filter does not break results', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    const applied = await searchPage.applyMinMaxPrice('1', '1000000');
    if (!applied) test.skip(true, 'Filter form not available on this environment.');

    const resultsCount = await searchPage.getResultsCount();
    expect(resultsCount).toBeGreaterThan(0);
  });

  test('Performance: results load within threshold', async () => {
    test.slow();
    const thresholdMs = Number(process.env.SEARCH_PERF_MS ?? 10000);
    const start = Date.now();
    await searchPage.search('phone', { trigger: 'button', timeoutMs: Math.max(thresholdMs, 15000) });
    const duration = Date.now() - start;
    expect.soft(duration).toBeLessThan(thresholdMs);
  });

  test('UI elements: product cards visible and have a non-empty name', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await expect(searchPage.searchResults.first()).toBeVisible();
    const name = await searchPage.getProductNameByIndex(0);
    expect(name.length).toBeGreaterThan(0);
  });

  test('Auto suggest (if available): typing shows suggestion dropdown', async () => {
    await expect(searchPage.searchInput).toBeVisible();
    await searchPage.searchInput.fill('ph');
    const visible = await searchPage.isAutoSuggestVisible();
    if (!visible) test.skip(true, 'Auto-suggest dropdown not available/visible for this environment.');
    expect(visible).toBeTruthy();
  });

  test('Search persistence on refresh: results persist or reset (non-crashing)', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await page.reload();
    await expect(page).toHaveURL(/\/products(\?|$)/);
    expect(page.url()).toContain('/products');
  });

  test('URL validation: after search URL contains name query param', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await expect(page).toHaveURL(/\/products\?/);
    expect(page.url()).toMatch(/[\?&]name=/);
  });
});
