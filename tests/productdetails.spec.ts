import { expect, test } from './fixtures/baseTest';
import { BASE_URL } from '../src/utils/env';
import { SearchPage } from '../src/pages/SearchPage';
import { ProductDetailsPage } from '../src/pages/ProductDetailsPage';

test.describe('Product Details Page Tests', () => {
  let searchPage: SearchPage;
  let productDetailsPage: ProductDetailsPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    productDetailsPage = new ProductDetailsPage(page);
    await searchPage.navigateTo(BASE_URL);
  });

  test('Page load & basic UI', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.expectPageLoadedWithoutError();
    await productDetailsPage.expectTitleVisible();
    await productDetailsPage.expectImageVisible();
    await productDetailsPage.expectUnitPriceVisible();
    await productDetailsPage.expectBuyNowAndAddToCartEnabledIfPresent();
    await expect(page).toHaveURL(/\/product\//);
  });

  test('Title matches the selected product from the list (best-effort)', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    const expectedTitle = await searchPage.getProductNameByIndex(0);
    await searchPage.clickProductByIndex(0);

    const actualTitle = await productDetailsPage.getTitleText();
    expect(actualTitle.toLowerCase()).toContain(expectedTitle.toLowerCase().slice(0, Math.min(10, expectedTitle.length)));
  });

  test('Discount/original price shape is consistent if discount is present', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.expectDiscountPriceShapeIfPresent();
  });

  test('Image gallery thumbnails update the main image if present', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.expectThumbnailsWorkIfPresent();
  });

  test('Quantity cannot go below 1 if quantity selector exists', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.setQuantity(0);
    await productDetailsPage.expectQuantityNotBelowOneIfPresent();
  });

  test('Add to cart updates cart (toast/cart badge)', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    const hasAddToCart = await productDetailsPage.addToCartButton.isVisible().catch(() => false);
    if (!hasAddToCart) test.skip(true, 'Add to cart button not available in this environment.');

    await productDetailsPage.clickAddToCart();
    await productDetailsPage.expectCartUpdatedAfterAdd();
  });

  test('Buy now redirects to checkout or cart', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    const hasBuyNow = await productDetailsPage.buyNowButton.isVisible().catch(() => false);
    if (!hasBuyNow) test.skip(true, 'Buy now button not available in this environment.');

    const outcome = await productDetailsPage.proceedToCheckout();
    expect(['checkout', 'cart', 'login', 'stayed']).toContain(outcome);
    // If it navigated, ensure it's one of the allowed destinations.
    if (outcome !== 'stayed') {
      await expect(page).toHaveURL(/\/checkout|\/checkout-details|\/shipping|\/payment|\/cart|\/login|\/customer\/auth/i);
    }
  });

  test('Wishlist action either succeeds or requires login', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    const hasWishlist = await productDetailsPage.wishlistButton.isVisible().catch(() => false);
    if (!hasWishlist) test.skip(true, 'Wishlist control not available in this environment.');

    await productDetailsPage.toggleWishlistIfPresent();
    await productDetailsPage.expectWishlistOrLoginPrompt();
    await expect(page.locator('body')).toBeVisible();
  });

  test('Description expands via See More if available', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.expandDescriptionIfPresent();
    await expect(page.locator('body')).toContainText(/description|specification|feature/i);
  });

  test('Tabs switch (Overview/Reviews) without breaking UI if present', async () => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.clickTabIfPresent('Overview');
    await productDetailsPage.clickTabIfPresent('Reviews');
    await productDetailsPage.expectTabContentLoads();
  });

  test('Vendor section and chat behavior (best-effort)', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    await productDetailsPage.expectVendorDetailsVisibleIfPresent();
    await productDetailsPage.openChatWithVendorIfPresent();
    await expect(page.locator('body')).toBeVisible();
  });

  test('Similar products navigate to another product details page if available', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);

    const opened = await productDetailsPage.openFirstSimilarProductIfPresent();
    if (!opened) test.skip(true, 'Similar products section not available in this environment.');

    await expect(page).toHaveURL(/\/product\//);
  });

  test('Refresh keeps same product and back returns to products page', async ({ page }) => {
    await searchPage.search('phone', { trigger: 'button' });
    await searchPage.clickProductByIndex(0);
    await expect(page).toHaveURL(/\/product\//);

    const productUrl = page.url();
    await page.reload();
    await expect(page).toHaveURL(productUrl);

    await page.goBack();
    await expect(page).toHaveURL(/\/products(\?|$)/);
  });

  test('Invalid product URL shows error/404 message', async ({ page }) => {
    await page.goto(`${BASE_URL}/product/this-product-should-not-exist-0000000`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toContainText(/404|not\s+found|page\s+not\s+found|oops|invalid/i);
  });
});
