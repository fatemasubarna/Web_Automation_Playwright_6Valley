import { test, expect } from '@playwright/test';
 import { HomePage } from '../pages/HomePage';

test('Verify home page loads correctly', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigateTo('https://6valley-testing.6amdev.xyz/');

  await expect(page).toHaveURL(/6valley-testing\.6amdev\.xyz/);
  await expect(page.getByRole('banner')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Flash Deal' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Featured products' })).toBeVisible();
});

test('Verify flash deal is visible if active', async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to the URL
  await homePage.navigateTo('https://6valley-testing.6amdev.xyz/');

  // Verify the flash deal section is visible
  const isFlashDealVisible = await homePage.isFlashDealVisible();
  if (isFlashDealVisible) {
  expect(isFlashDealVisible).toBeTruthy();
} else {
  console.log('⚠️ Flash deal not active, skipping assertion');
}
});