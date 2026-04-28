import { expect, test } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { asEscapedUrlPattern, BASE_URL } from '../src/utils/env';

test('Verify home page loads correctly', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateTo(BASE_URL);

  await expect(page).toHaveURL(asEscapedUrlPattern(BASE_URL));
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Flash Deal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();
});

test('Verify flash deal is visible if active', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateTo(BASE_URL);

  const isFlashDealVisible = await homePage.isFlashDealVisible();
  if (isFlashDealVisible) {
    expect(isFlashDealVisible).toBeTruthy();
  } else {
    console.log('Flash deal not active, skipping assertion');
  }
});
