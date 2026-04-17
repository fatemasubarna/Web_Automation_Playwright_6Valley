import { Page } from '@playwright/test';

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { timeout: 60000 }); // Increased timeout to 60 seconds
  }

  async verifyHomePageLoaded(): Promise<boolean> {
    // Debugging: Take a screenshot to inspect the page state
    await this.page.screenshot({ path: 'homepage_debug.png', fullPage: true });

    // Updated locator to check for a visible child element within the banner
    return this.page.locator('banner >> text=').isVisible();
  }

  async isFlashDealVisible(): Promise<boolean> {
    // Check if the flash deal section is visible on the home page
    const isVisible = this.page.locator('section.flash-deal').isVisible();

    // Debugging: Capture a screenshot of the flash deal section
    await this.page.locator('section.flash-deal').screenshot({ path: 'flash_deal_debug.png' });

    // Debugging: Check if the flash deal section exists
    const flashDealCount = await this.page.locator('section.flash-deal').count();
    console.log(`Flash deal section count: ${flashDealCount}`);

    return isVisible;
  }
}