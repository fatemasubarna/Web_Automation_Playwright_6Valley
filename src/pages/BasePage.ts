import { expect, type Locator, type Page } from '@playwright/test';
import { neutralizeUiInterference } from '../utils/overlayHandler';
import { safeClick, type SafeClickOptions } from '../utils/safeClick';

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

  /**
   * Enterprise-grade click wrapper.
   * Defaults to overlay neutralization and non-navigation clicks.
   * Pass `wait.kind='url'` or `wait.kind='auto'` when navigation might happen.
   */
  protected async click(locator: Locator, options: SafeClickOptions = {}): Promise<void> {
    await safeClick(this.page, locator, {
      neutralizeOverlays: true,
      ...options,
    });
  }

  /**
   * Apply global mitigations for test-unfriendly UI layers (debug bars, hover overlays).
   * Call once per test (or inside a fixture) to keep all interactions consistent.
   */
  protected async applyOverlayMitigations(): Promise<void> {
    await neutralizeUiInterference(this.page);
  }

  /**
   * Waits for a "stable" UI state without hard sleeps:
   * - domcontentloaded
   * - no visible spinners/loaders (best-effort)
   * - page is interactive (best-effort)
   */
  protected async waitForStableUI(timeoutMs = 15000): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: timeoutMs });

    const loadingLocators = this.page.locator(
      [
        '.spinner:visible',
        '.loading:visible',
        '.loader:visible',
        '[aria-busy="true"]:visible',
        ':text-matches("^\\s*loading\\.{0,3}\\s*$", "i"):visible',
      ].join(', '),
    );

    await expect
      .poll(async () => {
        const count = await loadingLocators.count();
        return count;
      }, {
        timeout: timeoutMs,
      })
      .toBe(0);

    await expect
      .poll(async () => {
        return this.page.evaluate(() => document.readyState);
      }, { timeout: timeoutMs })
      .toBe('complete');
  }
}
