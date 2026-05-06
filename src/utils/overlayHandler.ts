import type { Page } from '@playwright/test';

export type OverlayHandlerOptions = {
  /**
   * Disables pointer-events for known overlays/toolbars that commonly intercept clicks.
   * This is the safest global mitigation when overlays are not the test target.
   */
  pointerEventsNone?: boolean;
};

export async function neutralizeUiInterference(page: Page, options: OverlayHandlerOptions = {}): Promise<void> {
  const pointerEventsNone = options.pointerEventsNone ?? true;
  if (!pointerEventsNone) return;

  await page.addStyleTag({
    content: `
      /* Hover overlays / quick view */
      .quick-view,
      .quick-view *,
      [class*="quick-view" i],
      [class*="quick-view" i] *,
      /* PHP Debug Bar */
      .phpdebugbar,
      .phpdebugbar *,
      #phpdebugbar,
      #phpdebugbar *,
      [id^="phpdebugbar"],
      [id^="phpdebugbar"] *,
      /* Generic debug / sticky toolbars */
      .debug-bar,
      .debugbar,
      .debugbar *,
      .debug-toolbar,
      [data-testid*="debug" i],
      [class*="debug" i] {
        pointer-events: none !important;
      }
    `,
  });
}

