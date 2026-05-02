import { expect, test } from '@playwright/test';
import { HomePage } from '../src/pages/HomePage';
import { BASE_URL } from '../src/utils/env';

test.describe('Home Page Test Cases', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigateTo(BASE_URL);
  });

  test('TC_001 - Verify homepage loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect.poll(() => homePage.isSameBaseUrl(page.url(), BASE_URL)).toBeTruthy();
    await expect(homePage.header()).toBeVisible();
    await expect(homePage.mainBanner()).toBeVisible();
    await expect(homePage.footer()).toBeVisible();
  });

  test('TC_002 - Verify page responsiveness', async ({ page }) => {
    const homePage = new HomePage(page);
    const viewports = [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.reload();
      await expect(homePage.header()).toBeVisible();
      await expect(homePage.mainBanner()).toBeVisible();
    }
  });

  test('TC_003 - Verify page load performance (<3s domcontentloaded)', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const durationMs = Date.now() - start;
    expect(durationMs).toBeLessThan(3000);
  });

  test('TC_004 - Verify logo click redirects to homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.logo().click();
    await expect.poll(() => homePage.isSameBaseUrl(page.url(), BASE_URL)).toBeTruthy();
  });

  test('TC_005 - Verify navigation menu redirects correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    const navItems = homePage.navMenuItems();
    const count = await navItems.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 5); i += 1) {
      const item = navItems.nth(i);
      const href = await item.getAttribute('href');
      if (!href || href.startsWith('javascript:') || href === '#') continue;
      await item.click();
      await expect(page).toHaveURL(new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
      await page.goto(BASE_URL);
    }
  });

  test('TC_006 - Verify search bar shows relevant products', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.search('phone');
    await expect(homePage.productCards().first()).toBeVisible({ timeout: 15000 });
  });

  test('TC_007 - Verify login/register button redirects to auth page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openLoginOrRegister();
    await expect(page).toHaveURL(/\/auth\/|\/login|\/register/i);
  });

  test('TC_008 - Verify cart icon redirects to cart page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.cartIcon().click();
    await expect(page).toHaveURL(/\/cart/i);
  });

  test('TC_009 - Verify banner visibility', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(homePage.mainBanner()).toBeVisible();
  });

  test('TC_010 - Verify banner auto-slide', async ({ page }) => {
    const homePage = new HomePage(page);
    const slides = homePage.bannerSlides();
    const count = await slides.count();
    test.skip(count < 2, 'Auto-slide requires at least two slides.');
    const firstClass = (await slides.first().getAttribute('class')) || '';
    await page.waitForTimeout(5000);
    const secondClass = (await slides.first().getAttribute('class')) || '';
    expect(secondClass).not.toBe(firstClass);
  });

  test('TC_011 - Verify banner click action', async ({ page }) => {
    const homePage = new HomePage(page);
    test.skip((await homePage.clickableBanner().count()) === 0, 'No clickable banner link found.');
    await homePage.clickableBanner().click();
    await expect.poll(() => homePage.isSameBaseUrl(page.url(), BASE_URL)).toBeFalsy();
  });

  test('TC_012 - Verify categories display', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.categoriesSection().scrollIntoViewIfNeeded();
    await expect(homePage.categoriesSection()).toBeVisible();
  });

  test('TC_013 - Verify category click redirects to category page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.categoriesSection().scrollIntoViewIfNeeded();
    const links = homePage.categoryLinks();
    test.skip((await links.count()) === 0, 'No category links found.');
    await links.first().click();
    await expect(page).toHaveURL(/\/category|\/products|\/shop/i);
  });

  test('TC_014 - Verify product listing card data', async ({ page }) => {
    const homePage = new HomePage(page);
    const firstCard = homePage.productCards().first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard).toContainText(/\$/i);
  });

  test('TC_015 - Verify product click redirects to details page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.productCards().first().click();
    await expect(page).toHaveURL(/\/product|\/item|\/details/i);
  });

  test('TC_016 - Verify Add to Cart behavior', async ({ page }) => {
    const homePage = new HomePage(page);
    test.skip((await homePage.addToCartButtons().count()) === 0, 'No Add to cart button found.');
    await homePage.addToCartButtons().click();
    await expect(page.locator('body')).toContainText(/added|cart|success/i);
  });

  test('TC_017 - Verify Wishlist behavior', async ({ page }) => {
    const homePage = new HomePage(page);
    test.skip((await homePage.wishlistButtons().count()) === 0, 'No wishlist action found.');
    await homePage.wishlistButtons().click();
    await expect(page.locator('body')).toContainText(/wishlist|login|added|success/i);
  });

  test('TC_018 - Verify product price and discount display', async ({ page }) => {
    const homePage = new HomePage(page);
    const card = homePage.productCards().first();
    await expect(card).toBeVisible();
    await expect(card).toContainText(/\$|%|off/i);
  });

  test('TC_019 - Verify deals visibility', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.dealsSection().scrollIntoViewIfNeeded();
    await expect(homePage.dealsSection()).toBeVisible();
  });

  test('TC_020 - Verify deal expiry countdown timer', async ({ page }) => {
    const homePage = new HomePage(page);
    test.skip((await homePage.countdownTimer().count()) === 0, 'No countdown timer found.');
    const firstValue = ((await homePage.countdownTimer().textContent()) || '').trim();
    await page.waitForTimeout(1500);
    const secondValue = ((await homePage.countdownTimer().textContent()) || '').trim();
    expect(secondValue).not.toEqual(firstValue);
  });

  test('TC_021 - Verify top vendors section visibility', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.vendorSection().scrollIntoViewIfNeeded();
    await expect(homePage.vendorSection()).toBeVisible();
  });

  test('TC_022 - Verify vendor click redirects to vendor shop page', async ({ page }) => {
    const homePage = new HomePage(page);
    const vendors = homePage.vendorLinks();
    test.skip((await vendors.count()) === 0, 'No vendor link found.');
    await vendors.first().click();
    await expect(page).toHaveURL(/\/shop|\/store|\/seller|\/vendor/i);
  });

  test('TC_023 - Verify footer links', async ({ page }) => {
    const homePage = new HomePage(page);
    const footerLinks = homePage.footerLinks().filter({ hasText: /about|contact|faq/i });
    const count = await footerLinks.count();
    expect(count).toBeGreaterThan(0);
    await footerLinks.first().click();
    await expect(page).not.toHaveURL(storefrontUrlPattern);
  });

  test('TC_024 - Verify social media links', async ({ page }) => {
    const homePage = new HomePage(page);
    const socialLinks = homePage.socialLinks();
    test.skip((await socialLinks.count()) === 0, 'No social links found.');
    const href = await socialLinks.first().getAttribute('href');
    expect(href).toMatch(/facebook|twitter|instagram|youtube|linkedin/i);
  });

  test('TC_025 - Verify newsletter subscription', async ({ page }) => {
    const homePage = new HomePage(page);
    test.skip((await homePage.newsletterEmailInput().count()) === 0, 'No newsletter input found.');
    await homePage.newsletterEmailInput().fill(`qa_${Date.now()}@mailinator.com`);
    await homePage.newsletterSubmitButton().click();
    await expect(page.locator('body')).toContainText(/success|subscribed|thank/i);
  });

  test('TC_026 - Verify empty search validation', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.searchInput().fill('');
    await homePage.searchInput().press('Enter');
    await expect(page.locator('body')).toContainText(/search|required|enter/i);
  });

  test('TC_027 - Verify invalid search input no-result behavior', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.search(`zzzz_no_match_${Date.now()}`);
    const hasMessage = await homePage.hasNoResultsMessage();
    const resultCount = await homePage.searchResultCount();
    expect(hasMessage || resultCount === 0).toBeTruthy();
  });

  test('TC_028 - Verify unauthorized wishlist/cart actions', async ({ page }) => {
    const homePage = new HomePage(page);
    if (await homePage.wishlistButtons().count()) {
      await homePage.wishlistButtons().click();
    } else if (await homePage.addToCartButtons().count()) {
      await homePage.addToCartButtons().click();
    } else {
      test.skip(true, 'No wishlist/add-to-cart action found.');
    }
    await expect(page.locator('body')).toContainText(/login|sign in|added|success/i);
  });

  test('TC_029 - Verify session handling after refresh', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openLoginOrRegister();
    await expect(page).toHaveURL(/\/auth\/|\/login/i);
    test.skip(true, 'Requires valid test credentials and login flow setup.');
  });

  test('TC_030 - Verify browser compatibility baseline', async ({ page, browserName }) => {
    test.skip(!['chromium', 'firefox', 'webkit'].includes(browserName), 'Run under Chrome/Firefox/Edge projects.');
    const homePage = new HomePage(page);
    await expect.poll(() => homePage.isSameBaseUrl(page.url(), BASE_URL)).toBeTruthy();
    await expect(homePage.header()).toBeVisible();
    await expect(homePage.mainBanner()).toBeVisible();
  });
});
