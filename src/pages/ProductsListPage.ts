import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ProductCard } from '../components/ProductCard';

export class ProductsListPage extends BasePage {
  readonly resultsContainer: Locator;
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.resultsContainer = this.page.locator('#ajax-products-view');
    this.productCards = this.resultsContainer.locator('.product-single-hover');
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.resultsContainer).toBeVisible({ timeout: 15000 });
    await this.waitForStableUI(15000);
  }

  cardByIndex(index: number): ProductCard {
    return new ProductCard(this.page, this.productCards.nth(index));
  }
}

