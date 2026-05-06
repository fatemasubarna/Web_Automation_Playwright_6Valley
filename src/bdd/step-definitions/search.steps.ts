import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { BASE_URL } from '../../utils/env';

const emptyStateRegex = /no\s+(products?|items?|results?)|not\s+found|nothing\s+found/i;
const searchPage = (world: CustomWorld) => world.pages.searchPage;
const homePage = (world: CustomWorld) => world.pages.homePage;

type SearchWorld = CustomWorld & {
  searchSavedTopResults?: string[];
  searchConsistencyBaseline?: string[];
  searchConsistencyLast?: string[];
};

Given('I am on the home page', async function (this: CustomWorld) {
  await homePage(this).navigateTo(BASE_URL);
});

When('I search for {string}', async function (this: CustomWorld, searchTerm: string) {
  await searchPage(this).search(searchTerm, { trigger: 'button' });
});

When('I search for {string} using Enter', async function (this: CustomWorld, searchTerm: string) {
  await searchPage(this).search(searchTerm, { trigger: 'enter' });
});

When('I search for {string} using search button', async function (this: CustomWorld, searchTerm: string) {
  await searchPage(this).search(searchTerm, { trigger: 'button' });
});

When('I search for the following keywords:', async function (this: SearchWorld, dataTable) {
  const keywords = dataTable.raw().map((row: string[]) => (row[0] ?? '').trim());
  const snapshots: string[][] = [];

  for (const keyword of keywords) {
    await searchPage(this).search(keyword, { trigger: 'button' });
    snapshots.push((await searchPage(this).getTopProductNames(5)).map((v) => v.toLowerCase()));
    await homePage(this).navigateTo(BASE_URL);
  }

  this.searchConsistencyBaseline = snapshots[0] ?? [];
  this.searchConsistencyLast = snapshots[snapshots.length - 1] ?? [];
  // Store all snapshots as flattened string for debugging if needed
  this.searchSavedTopResults = snapshots.flat();
});

When('I search for a very long keyword', async function (this: CustomWorld) {
  const longText = 'phone '.repeat(25).trim();
  await searchPage(this).search(longText, { trigger: 'button' });
});

When('I open the first product result', async function (this: CustomWorld) {
  await searchPage(this).clickProductByIndex(0);
});

When('I save the top {int} results', async function (this: SearchWorld, count: number) {
  this.searchSavedTopResults = (await searchPage(this).getTopProductNames(count)).map((v) => v.toLowerCase());
});

When('I refresh the page', async function (this: CustomWorld) {
  await this.page.reload();
});

When('I search for {string} within {int} seconds', async function (this: CustomWorld, searchTerm: string, seconds: number) {
  await searchPage(this).search(searchTerm, { trigger: 'button', timeoutMs: seconds * 1000 });
});

Then('search results should include {string}', async function (this: CustomWorld, expectedText: string) {
  const resultsCount = await searchPage(this).getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);

  const firstProductName = (await searchPage(this).getFirstProductName()).toLowerCase();
  expect(firstProductName).toContain(expectedText.trim().toLowerCase());
});

Then('I should see some search results', async function (this: CustomWorld) {
  const resultsCount = await searchPage(this).getResultsCount();
  expect(resultsCount).toBeGreaterThan(0);
});

Then('I should see no search results', async function (this: CustomWorld) {
  const resultsCount = await searchPage(this).getResultsCount();
  if (resultsCount > 0) {
    throw new Error(`Expected no results, but found ${resultsCount}.`);
  }

  await expect(this.page.locator('body')).toContainText(emptyStateRegex);
});

Then('I should be on the products results page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/products(\?|$)/);
  await expect(searchPage(this).resultsContainer).toBeVisible();
});

Then('I should be on a product details page', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/product\//);
});

Then('the top search results should be consistent', async function (this: SearchWorld) {
  const baseline = this.searchConsistencyBaseline ?? [];
  const last = this.searchConsistencyLast ?? [];
  expect(last).toEqual(baseline);
});

Then('the top {int} results should match the saved results', async function (this: SearchWorld, count: number) {
  const saved = this.searchSavedTopResults ?? [];
  const current = (await searchPage(this).getTopProductNames(count)).map((v) => v.toLowerCase());
  expect(current).toEqual(saved);
});

Then('the URL should contain {string}', async function (this: CustomWorld, fragment: string) {
  expect(this.page.url()).toContain(fragment);
});
