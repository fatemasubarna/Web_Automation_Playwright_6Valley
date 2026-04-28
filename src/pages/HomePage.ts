import { Page } from '@playwright/test';

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { timeout: 60000 });
  }

  async isFlashDealVisible(): Promise<boolean> {
    return this.page.locator('section.flash-deal').isVisible();
  }
}
