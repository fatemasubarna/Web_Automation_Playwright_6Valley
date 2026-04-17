import { test, expect } from '@playwright/test';
import { SearchPage } from '../pages/SearchPage';

test.describe('Search Page Tests', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigateTo('https://6valley-testing.6amdev.xyz/');
  });

  test('Search for an item and verify results', async () => {
    const searchTerm = 'phone';

    // Perform search
    await searchPage.searchForItem(searchTerm);

    // Verify at least one result is visible
    const firstProductName = await searchPage.getFirstProductName();
    expect(firstProductName).toContain(searchTerm);
  });
});