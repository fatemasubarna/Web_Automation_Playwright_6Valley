import { test as base, expect } from '@playwright/test';
import { neutralizeUiInterference } from '../../src/utils/overlayHandler';

export const test = base.extend({
  page: async ({ page }, use) => {
    await neutralizeUiInterference(page);
    await use(page);
  },
});

export { expect };
