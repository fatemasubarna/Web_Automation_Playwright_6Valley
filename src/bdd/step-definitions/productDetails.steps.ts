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

Then('I should be redirected to checkout or cart', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/checkout|\/checkout-details|\/shipping|\/payment|\/cart/i);
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
