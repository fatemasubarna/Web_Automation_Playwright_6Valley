import { Page, Locator, expect } from '@playwright/test';
import { safeClick } from '../utils/safeClick';

export class SearchPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchForm: Locator;
  readonly autoSuggestBox: Locator;
  readonly resultsContainer: Locator;
  readonly searchResults: Locator;
  readonly emptyState: Locator;
  readonly sortSelect: Locator;
  readonly filterForm: Locator;

  constructor(page: Page) {
    this.page = page;

    // Provided locators from the app UI
    this.searchInput = this.page.getByPlaceholder('Search for items...');
    // Prefer clicking the submit button (more reliable than clicking the inner <span>)
    this.searchButton = this.page.locator('button.search_button:has(i.czi-search)');
    this.searchForm = this.page.locator('form.search_form').first();
    this.autoSuggestBox = this.searchForm.locator('.search-result-box').first();

    // Search results live on /products under this container
    this.resultsContainer = this.page.locator('#ajax-products-view');
    this.searchResults = this.resultsContainer.locator('.product-single-hover');
    this.emptyState = this.resultsContainer.locator(
      ':text-matches("no\\\\s+(products?|items?|results?)|not\\\\s+found|nothing\\\\s+found", "i")'
    );

    // Sort/filter controls (exist on /products)
    this.sortSelect = this.page.locator('select[name="sort_by"]').first();
    this.filterForm = this.page.locator('form.product-list-filter').first();
  }

  // Navigate to any URL
  async navigateTo(url: string) {
    await this.page.goto(url);
    // Wait for page to fully load
    await this.page.waitForLoadState('domcontentloaded');
  }

  async searchForItem(item: string) {
    await this.search(item, { trigger: 'button' });
  }

  async search(
    item: string,
    options: {
      trigger?: 'button' | 'enter';
      timeoutMs?: number;
    } = {},
  ) {
    // Wait for visible input
    const timeoutMs = options.timeoutMs ?? 15000;
    await expect(this.searchInput).toBeVisible({ timeout: 10000 });

    // Fill then trigger search
    await this.searchInput.fill(item);

    if (options.trigger === 'enter') {
      await this.searchInput.press('Enter');
    } else {
      const canClick = await this.searchButton.first().isVisible().catch(() => false);
      if (canClick) {
        await this.searchButton.first().click();
      } else {
        await this.searchInput.press('Enter');
      }
    }

    await this.waitForResultsOrEmptyState(timeoutMs);
  }

  async waitForResultsOrEmptyState(timeout = 15000): Promise<void> {
    await this.page.waitForURL(/\/products(\?|$)/, { timeout });
    await expect(this.resultsContainer).toBeVisible({ timeout });

    await Promise.race([
      expect(this.searchResults.first()).toBeVisible({ timeout }),
      expect(this.emptyState).toBeVisible({ timeout }),
    ]);
  }

  async getResultsCount(): Promise<number> {
    return this.searchResults.count();
  }

  async getSearchInputValue(): Promise<string> {
    return this.searchInput.inputValue();
  }

  async getTopProductNames(limit = 5): Promise<string[]> {
    const count = await this.searchResults.count();
    const effectiveLimit = Math.min(limit, count);
    const names: string[] = [];
    for (let i = 0; i < effectiveLimit; i++) {
      const name = await this.getProductNameByIndex(i);
      names.push(name);
    }
    return names;
  }

  async getProductNameByIndex(index: number): Promise<string> {
    const card = this.searchResults.nth(index);
    await expect(card).toBeVisible({ timeout: 10000 });
    const nameLink = card.locator('a[href*="/product/"]').first();
    const text = (await nameLink.textContent()) ?? '';
    return text.trim();
  }

  async getProductPriceTextByIndex(index: number): Promise<string> {
    const card = this.searchResults.nth(index);
    await expect(card).toBeVisible({ timeout: 10000 });
    const priceCandidate = card
      .locator(
        [
          '.product-price',
          '.price',
          ':text-matches("(৳|\\$|€|£)\\s*\\d|\\d\\s*(৳|\\$|€|£)", "i")',
        ].join(', '),
      )
      .first();
    const visible = await priceCandidate.isVisible().catch(() => false);
    if (!visible) return '';
    return ((await priceCandidate.textContent()) ?? '').trim();
  }

  async clickProductByIndex(index: number): Promise<void> {
    const card = this.searchResults.nth(index);
    await expect(card).toBeVisible({ timeout: 10000 });
    const productLink = card.locator('a[href*="/product/"]').first();
    await safeClick(this.page, productLink, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'url', pattern: /\/product\// } });
  }

  async getResultCountText(): Promise<string> {
    const counter = this.page.locator(':text-matches("(items?|products?)\\\\s+found|found\\\\s+(items?|products?)", "i")').first();
    const isVisible = await counter.isVisible().catch(() => false);
    if (!isVisible) return '';
    return (await counter.textContent())?.trim() ?? '';
  }

  async expectEmptyStateVisible(): Promise<void> {
    await expect(this.emptyState).toBeVisible({ timeout: 15000 });
  }

  async isAutoSuggestVisible(): Promise<boolean> {
    return this.autoSuggestBox.isVisible().catch(() => false);
  }

  async applySortByValue(value: string): Promise<boolean> {
    const isVisible = await this.sortSelect.isVisible().catch(() => false);
    if (!isVisible) return false;
    await this.sortSelect.selectOption(value);
    await expect(this.resultsContainer).toBeVisible();
    return true;
  }

  async applyMinMaxPrice(min: string, max: string): Promise<boolean> {
    const isVisible = await this.filterForm.isVisible().catch(() => false);
    if (!isVisible) return false;
    const minInput = this.filterForm.locator('input[name="min_price"], input[placeholder*="Min" i]').first();
    const maxInput = this.filterForm.locator('input[name="max_price"], input[placeholder*="Max" i]').first();
    const canFill = await minInput.isVisible().catch(() => false);
    if (!canFill) return false;

    await minInput.fill(min);
    await maxInput.fill(max);
    const submit = this.filterForm.locator('button:has-text("Filter"), button[type="submit"], .action-search-products-by-price').first();
    const canSubmit = await submit.isVisible().catch(() => false);
    if (!canSubmit) return false;
    await submit.click();
    await expect(this.resultsContainer).toBeVisible();
    return true;
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
