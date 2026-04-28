import { expect, test } from '@playwright/test';
import { SearchPage } from '../src/pages/SearchPage';
import { BASE_URL } from '../src/utils/env';

test.describe('Search Page Tests', () => {
  let searchPage: SearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    await searchPage.navigateTo(BASE_URL);
  });

  test('Search for an item and verify results', async () => {
    const searchTerm = 'phone';

    await searchPage.searchForItem(searchTerm);

    const firstProductName = await searchPage.getFirstProductName();
    expect(firstProductName.toLowerCase()).toContain(searchTerm);
  });
});
