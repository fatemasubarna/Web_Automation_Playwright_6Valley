import { expect, type Locator, type Page } from '@playwright/test';
import { safeClick } from '../utils/safeClick';

export class ProductCard {
  private readonly page: Page;
  private readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  productLink(): Locator {
    // Prefer stable/product links; avoid quick-view links.
    return this.root.locator('a[href*="/product/"]').first();
  }

  async titleText(): Promise<string> {
    const link = this.productLink();
    await expect(link).toBeVisible({ timeout: 15000 });
    return ((await link.textContent()) ?? '').trim();
  }

  async openProductDetails(): Promise<void> {
    const link = this.productLink();
    await safeClick(this.page, link, {
      neutralizeOverlays: true,
      wait: { kind: 'url', pattern: /\/product\// },
      timeoutMs: 15000,
    });
  }
}

