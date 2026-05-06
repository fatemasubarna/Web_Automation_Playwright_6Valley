import { expect, type Locator, type Page } from '@playwright/test';
import { neutralizeUiInterference } from './overlayHandler';

export type SafeClickWait =
  | { kind: 'none' }
  | { kind: 'url'; pattern: RegExp }
  | {
      /**
       * Auto-detects navigation quickly but never blocks the click when it doesn't navigate.
       * Useful for buttons/links that sometimes navigate (auth-dependent flows).
       */
      kind: 'auto';
      /**
       * If provided, only treat navigation as successful when the final URL matches this pattern.
       * If omitted, any URL change counts.
       */
      pattern?: RegExp;
      /**
       * How long to wait for navigation detection before continuing (kept small to avoid timeouts).
       */
      maxWaitMs?: number;
    };

export type SafeClickOptions = {
  timeoutMs?: number;
  wait?: SafeClickWait;
  neutralizeOverlays?: boolean;
  /**
   * Number of click attempts before keyboard/force fallbacks.
   */
  retries?: number;
};

const DEFAULT_TIMEOUT_MS = 15000;

function isRetryableClickError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return /intercepts pointer events|element is not stable|not receiving pointer events|another element would receive the click|element is outside of the viewport/i.test(
    message,
  );
}

async function maybeWaitForNavigation(page: Page, beforeUrl: string, wait: SafeClickWait | undefined, timeoutMs: number): Promise<void> {
  const config = wait ?? { kind: 'none' as const };
  if (config.kind === 'none') return;

  if (config.kind === 'url') {
    await page.waitForURL(config.pattern, { timeout: timeoutMs });
    return;
  }

  // kind: 'auto' — never block for long.
  const maxWaitMs = config.maxWaitMs ?? 2500;
  const pattern = config.pattern;
  const predicate = (url: URL) => {
    const href = url.toString();
    if (href === beforeUrl) return false;
    if (!pattern) return true;
    return pattern.test(href);
  };

  await page.waitForURL(predicate, { timeout: maxWaitMs }).catch(() => {
    // Intentionally ignore: click might not navigate.
  });
}

/**
 * Production-grade click engine for flaky UIs:
 * - scrolls into view
 * - optionally neutralizes overlay interference
 * - retries on common "intercepted / not stable" failures
 * - supports navigation, non-navigation, and auto-navigation flows
 * - falls back to keyboard activation, then force click only as last resort
 */
export async function safeClick(page: Page, target: Locator, options: SafeClickOptions = {}): Promise<void> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options.retries ?? 2;

  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible({ timeout: timeoutMs });

  if (options.neutralizeOverlays) {
    await neutralizeUiInterference(page);
  }

  const beforeUrl = page.url();

  const attemptClick = async (): Promise<void> => {
    // Reduce hover-triggered overlays intercepting the click.
    await page.mouse.move(0, 0).catch(() => {});

    // Trial click to force Playwright to wait for actionability (without side effects).
    await target.click({ trial: true, timeout: Math.min(timeoutMs, 5000) }).catch(() => {});

    await Promise.all([
      maybeWaitForNavigation(page, beforeUrl, options.wait, timeoutMs),
      target.click({ timeout: Math.min(timeoutMs, 10000) }),
    ]);
  };

  let lastErr: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      await target.scrollIntoViewIfNeeded();
      await attemptClick();
      return;
    } catch (err) {
      lastErr = err;
      if (!isRetryableClickError(err)) throw err;
    }
  }

  // Fallback 1: keyboard activation (avoids pointer hit-testing).
  try {
    await Promise.all([
      maybeWaitForNavigation(page, beforeUrl, options.wait, timeoutMs),
      (async () => {
        await target.focus();
        await page.keyboard.press('Enter');
      })(),
    ]);
    return;
  } catch (err) {
    lastErr = err;
  }

  // Fallback 2 (last resort): force click. Use only when UI overlays cannot be neutralized.
  await Promise.all([
    maybeWaitForNavigation(page, beforeUrl, options.wait, timeoutMs),
    target.click({ force: true, timeout: Math.min(timeoutMs, 10000) }),
  ]).catch((err) => {
    throw (lastErr ?? err) as Error;
  });
}
