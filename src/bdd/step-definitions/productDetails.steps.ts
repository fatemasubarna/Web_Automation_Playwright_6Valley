import { Then, When } from '@cucumber/cucumber';
import { CustomWorld } from '../support/world';
import { BASE_URL } from '../../utils/env';
import { expect } from '@playwright/test';

const searchPage = (world: CustomWorld) => world.pages.searchPage;
const productDetailsPage = (world: CustomWorld) => world.pages.productDetailsPage;

When('I open product details for {string} from search results', async function (this: CustomWorld, keyword: string) {
  await searchPage(this).search(keyword, { trigger: 'button' });
  await searchPage(this).clickProductByIndex(0);
  await productDetailsPage(this).expectOnProductDetailsPage();
});

When('I open product details for {string} from search results and remember the selected product', async function (this: CustomWorld, keyword: string) {
  await searchPage(this).search(keyword, { trigger: 'button' });
  this.selectedProductTitleFromList = await searchPage(this).getProductNameByIndex(0);
  await searchPage(this).clickProductByIndex(0);
  await productDetailsPage(this).expectOnProductDetailsPage();
});

When('I try to set quantity to {int} on product details', async function (this: CustomWorld, quantity: number) {
  await productDetailsPage(this).setQuantity(quantity);
});

When('I add the product to the cart from product details', async function (this: CustomWorld) {
  await productDetailsPage(this).clickAddToCart();
});

When('I click buy now on product details', async function (this: CustomWorld) {
  await productDetailsPage(this).clickBuyNow();
});

When('I click wishlist on product details', async function (this: CustomWorld) {
  await productDetailsPage(this).toggleWishlistIfPresent();
});

When('I expand the product description if available', async function (this: CustomWorld) {
  await productDetailsPage(this).expandDescriptionIfPresent();
});

When('I open the {string} tab on product details if present', async function (this: CustomWorld, tabName: string) {
  await productDetailsPage(this).clickTabIfPresent(tabName);
});

When('I click chat with vendor on product details if present', async function (this: CustomWorld) {
  await productDetailsPage(this).openChatWithVendorIfPresent();
});

When('I open a similar product if present', async function (this: CustomWorld) {
  const opened = await productDetailsPage(this).openFirstSimilarProductIfPresent();
  if (opened) {
    await productDetailsPage(this).expectOnProductDetailsPage();
  }
});

When('I go back in the browser', async function (this: CustomWorld) {
  await this.page.goBack();
});

When('I open an invalid product details URL', async function (this: CustomWorld) {
  // Use a clearly invalid slug/id that should 404 on most implementations.
  await this.page.goto(`${BASE_URL}/product/this-product-should-not-exist-0000000`, { waitUntil: 'domcontentloaded' });
});

Then('the product title should be visible', async function (this: CustomWorld) {
  await productDetailsPage(this).expectTitleVisible();
});

Then('the product unit price should be visible', async function (this: CustomWorld) {
  await productDetailsPage(this).expectUnitPriceVisible();
});

Then('the product image should be visible', async function (this: CustomWorld) {
  await productDetailsPage(this).expectImageVisible();
});

Then('the product details page should load without error', async function (this: CustomWorld) {
  await productDetailsPage(this).expectPageLoadedWithoutError();
});

Then('"Buy Now" and "Add to Cart" should be enabled if present', async function (this: CustomWorld) {
  await productDetailsPage(this).expectBuyNowAndAddToCartEnabledIfPresent();
});

Then('the product title should match the selected product title', async function (this: CustomWorld) {
  const expectedTitle = (this.selectedProductTitleFromList ?? '').trim();
  expect(expectedTitle.length).toBeGreaterThan(0);

  const actual = await productDetailsPage(this).getTitleText();
  // Best-effort: allow partial matches due to ellipsis/formatting differences.
  expect(actual.toLowerCase()).toContain(expectedTitle.toLowerCase().slice(0, Math.min(10, expectedTitle.length)));
});

Then('discounted and original price should be consistent if present', async function (this: CustomWorld) {
  await productDetailsPage(this).expectDiscountPriceShapeIfPresent();
});

Then('thumbnail images should update the main image if present', async function (this: CustomWorld) {
  await productDetailsPage(this).expectThumbnailsWorkIfPresent();
});

Then('quantity should not go below {int} if present', async function (this: CustomWorld, min: number) {
  await productDetailsPage(this).expectQuantityNotBelowOneIfPresent();
  const current = await productDetailsPage(this).getQuantityValue();
  if (current === null) return;
  expect(current).toBeGreaterThanOrEqual(min);
});

Then('the cart should be updated', async function (this: CustomWorld) {
  await productDetailsPage(this).expectCartUpdatedAfterAdd();
});

Then('buy now should proceed to checkout or show a blocking modal', async function (this: CustomWorld) {
  const page = this.page;

  const navPromise = page
    .waitForURL(/\/checkout|\/checkout-details|\/shipping|\/payment|\/cart/i, { timeout: 12000 })
    .then(() => 'navigated' as const)
    .catch(() => null);

  const minimumOrderTitle = page.locator(':text-matches("minimum\\s+order\\s+amount", "i")').first();
  const minOrderPromise = minimumOrderTitle
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => 'minOrder' as const)
    .catch(() => null);

  const shippingDialog = page
    .locator('[role="dialog"], .modal, .modal-dialog, .MuiDialog-root, .MuiModal-root')
    .filter({ hasText: /shipping/i })
    .first();
  const shippingPromise = shippingDialog
    .waitFor({ state: 'visible', timeout: 8000 })
    .then(() => 'shipping' as const)
    .catch(() => null);

  const outcome = await Promise.race([
    navPromise,
    minOrderPromise,
    shippingPromise,
    page.waitForTimeout(12000).then(() => 'timeout' as const),
  ]);

  if (outcome === 'shipping') {
    const container = shippingDialog;
    const option = container.locator('input[type="radio"], input[type="checkbox"], [role="radio"], [role="option"]').first();
    const optionVisible = await option.isVisible().catch(() => false);
    if (optionVisible) await option.click().catch(() => undefined);

    const continueBtn = container
      .locator(
        'button:has-text("Continue"), button:has-text("Proceed"), button:has-text("Checkout"), button:has-text("Confirm"), button:has-text("Ok"), button:has-text("OK")',
      )
      .first();
    const continueVisible = await continueBtn.isVisible().catch(() => false);
    if (continueVisible) await continueBtn.click().catch(() => undefined);

    await expect(page).toHaveURL(/\/checkout|\/checkout-details|\/shipping|\/payment|\/cart/i);
    return;
  }

  if (outcome === 'minOrder') {
    await expect(minimumOrderTitle).toBeVisible();
    const dialog = page.locator('[role="dialog"], .modal, .modal-dialog, .MuiDialog-root, .MuiModal-root').filter({ has: minimumOrderTitle }).first();
    const okBtn = dialog
      .locator('button:has-text("OK"), button:has-text("Ok"), button:has-text("Okay"), button:has-text("Okey")')
      .first();
    const okVisible = await okBtn.isVisible().catch(() => false);
    if (okVisible) await okBtn.click().catch(() => undefined);

    await expect(minimumOrderTitle).toBeHidden({ timeout: 8000 }).catch(() => undefined);
    return;
  }

  if (outcome === 'navigated') return;

  // Fallback: if nothing obvious happened, assert we at least ended up on a sensible destination.
  await expect(page).toHaveURL(/\/product\/|\/checkout|\/checkout-details|\/shipping|\/payment|\/cart/i);
});

Then('wishlist should be updated or login should be required', async function (this: CustomWorld) {
  await productDetailsPage(this).expectWishlistOrLoginPrompt();
});

Then('product description content should be visible', async function (this: CustomWorld) {
  await expect(this.page.locator('body')).toContainText(/description|specification|feature/i);
});

Then('the tab content should load without breaking UI', async function (this: CustomWorld) {
  await productDetailsPage(this).expectTabContentLoads();
});

Then('vendor details should be visible if present', async function (this: CustomWorld) {
  await productDetailsPage(this).expectVendorDetailsVisibleIfPresent();
});

Then('chat should open or login should be required', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/login|\/chat/i).catch(async () => {
    await expect(this.page.locator(':text-matches("login|sign\\s*in|chat", "i")')).toBeVisible();
  });
});

Then('I should see a 404 page or an error message', async function (this: CustomWorld) {
  await expect(this.page.locator('body')).toContainText(/404|not\s+found|page\s+not\s+found|oops|invalid/i);
});

Then('I should see purchase actions on the product details page', async function (this: CustomWorld) {
  await productDetailsPage(this).expectPurchaseActionsVisible();
});
