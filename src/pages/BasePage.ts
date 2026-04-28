import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async goto(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  protected async expectUrl(pattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(pattern);
  }

  protected async click(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toBeVisible();
    await locator.click();
  }
}
