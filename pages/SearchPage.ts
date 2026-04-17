import { Page, Locator, expect } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchResults: Locator;

  constructor(page: Page) {
    this.page = page;

    // Pick only visible search input to avoid hidden modals or mobile inputs
    this.searchInput = this.page.locator('input[placeholder="Search"]:visible');

    // Results container (update selector based on your site)
    this.searchResults = this.page.locator('.product-item, .product-card, [data-testid*="product"]');
  }

  // Navigate to any URL
  async navigateTo(url: string) {
    await this.page.goto(url);
    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Search for an item with auto-wait and dynamic handling
  async searchForItem(item: string) {
    // Wait for visible input
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });

    // Fill and press Enter
    await this.searchInput.fill(item);
    await this.searchInput.press('Enter');

    // Wait for results to appear
    await expect(this.searchResults.first()).toBeVisible({ timeout: 10000 });
  }

  // Verify an item exists in the results list
  async verifyItemInList(itemName: string): Promise<boolean> {
    const itemLocator = this.page.locator(`text=${itemName}:visible`);
    try {
      await expect(itemLocator.first()).toBeVisible({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // Optional: Get first product name for debugging
  async getFirstProductName(): Promise<string> {
    const firstProduct = this.searchResults.first();
    await expect(firstProduct).toBeVisible({ timeout: 10000 });
    const text = await firstProduct.textContent();
    if (text === null) {
      throw new Error('First product name is null');
    }
    return text;
  }
}