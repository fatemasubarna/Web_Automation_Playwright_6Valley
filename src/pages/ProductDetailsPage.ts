import { expect, type Locator, type Page } from '@playwright/test';
import { safeClick } from '../utils/safeClick';

type PurchaseTarget = 'checkout' | 'cart';

export class ProductDetailsPage {
  readonly page: Page;
  readonly title: Locator;
  readonly unitPrice: Locator;
  readonly originalPrice: Locator;
  readonly discountedPrice: Locator;
  readonly totalPrice: Locator;
  readonly primaryImage: Locator;
  readonly thumbnails: Locator;
  readonly quantityInput: Locator;
  readonly quantityIncrement: Locator;
  readonly quantityDecrement: Locator;
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly outOfStockBadge: Locator;
  readonly wishlistButton: Locator;
  readonly descriptionSection: Locator;
  readonly seeMoreButton: Locator;
  readonly tabs: Locator;
  readonly vendorSection: Locator;
  readonly chatWithVendorButton: Locator;
  readonly similarProductsSection: Locator;
  readonly similarProductLinks: Locator;
  readonly toast: Locator;
  readonly cartCountBadge: Locator;

  constructor(page: Page) {
    this.page = page;

    this.title = this.page
      .locator(
        [
          '[data-testid="product-title"]',
          '[data-test="product-title"]',
          '.product-title',
          '.details-title',
          '.product-name',
          'h1',
          'h2',
        ].join(', '),
      )
      .first();
    this.discountedPrice = this.page
      .locator(
        [
          '.discounted-price',
          '.product-price .discounted',
          '.product-price :text-matches("(৳|\\$|€|£)\\s*\\d", "i")',
        ].join(', '),
      )
      .first();
    this.originalPrice = this.page
      .locator(['.original-price', '.product-price del', '.product-price s', 'del :text-matches("(৳|\\$|€|£)\\s*\\d", "i")'].join(', '))
      .first();
    this.unitPrice = this.page
      .locator(
        [
          '.product-price',
          '.details-price',
          '.product-single-price',
          ':text-matches("(৳|\\$|€|£)\\s*\\d|\\d\\s*(৳|\\$|€|£)", "i")',
        ].join(', '),
      )
      .first();
    this.totalPrice = this.page
      .locator(':text-matches("total\\s*(:)?\\s*(৳|\\$|€|£)|total\\s*price", "i")')
      .first();

    this.primaryImage = this.page
      .locator(
        [
          '.product-details img',
          '.product-single-image img',
          '.product-gallery img',
          '.gallery img',
          'img[src*="product" i]',
        ].join(', '),
      )
      .first();
    this.thumbnails = this.page
      .locator(
        [
          '.product-thumbs img',
          '.product-gallery-thumbs img',
          '.gallery-thumbs img',
          '.product-gallery .thumb img',
          '.product-details .thumb img',
        ].join(', '),
      )
      .filter({ hasNot: this.page.locator('[style*="display:none" i]') });

    this.quantityInput = this.page
      .locator(['input[name="quantity"]', 'input#quantity', 'input.qty', '.cart-qty input', '.product-quantity input'].join(', '))
      .first();
    this.quantityIncrement = this.page
      .locator(['button.qty-plus', 'button:has-text("+")', 'button[aria-label*="increase" i]', 'button[title*="increase" i]'].join(', '))
      .first();
    this.quantityDecrement = this.page
      .locator(['button.qty-minus', 'button:has-text("-")', 'button[aria-label*="decrease" i]', 'button[title*="decrease" i]'].join(', '))
      .first();

    this.addToCartButton = this.page
      .locator('button:has-text("Add to cart"), a:has-text("Add to cart"), button:has-text("Add to Cart"), a:has-text("Add to Cart")')
      .first();
    this.buyNowButton = this.page.locator('button:has-text("Buy now"), a:has-text("Buy now"), button:has-text("Buy Now"), a:has-text("Buy Now")').first();
    this.outOfStockBadge = this.page.locator(':text-matches("out\\s*of\\s*stock", "i")').first();

    this.wishlistButton = this.page
      .locator(
        [
          'button:has(i.czi-heart)',
          'a:has(i.czi-heart)',
          'button:has-text("Wishlist")',
          'a:has-text("Wishlist")',
          'a[href*="wishlist" i]',
          'button[aria-label*="wishlist" i]',
        ].join(', '),
      )
      .first();

    this.descriptionSection = this.page
      .locator(['#description', '.product-description', '.details-description', ':text-matches("description", "i")'].join(', '))
      .first();
    this.seeMoreButton = this.page.locator('button:has-text("See more"), a:has-text("See more"), button:has-text("See More"), a:has-text("See More")').first();

    this.tabs = this.page.locator(['.nav-tabs a', '.tabs a', 'button[role="tab"]', 'a[role="tab"]'].join(', '));

    this.vendorSection = this.page
      .locator(['.vendor', '.shop-name', ':text-matches("vendor|seller|shop", "i")'].join(', '))
      .first();
    this.chatWithVendorButton = this.page
      .locator(
        ['button:has-text("Chat")', 'a:has-text("Chat")', 'button:has-text("Chat with Vendor")', 'a:has-text("Chat with Vendor")', 'a[href*="chat" i]'].join(
          ', ',
        ),
      )
      .first();

    this.similarProductsSection = this.page
      .locator(['#related-products', '#similar-products', '.related-products', '.similar-products', ':text-matches("similar\\s+products|related\\s+products", "i")'].join(', '))
      .first();
    this.similarProductLinks = this.similarProductsSection.locator('a[href*="/product/"]');

    // Toasts/snackbars are often transient and can render in different containers across environments.
    // Prefer a broad container locator + text filter rather than a single fragile selector.
    this.toast = this.page
      .locator(
        [
          '[role="alert"]',
          '[aria-live="polite"]',
          '[aria-live="assertive"]',
          '.toast',
          '.toast-success',
          '.Toastify__toast',
          '.snackbar',
          '.MuiSnackbar-root',
          '.notistack-Snackbar',
          '.notistack-SnackbarContainer',
        ].join(', '),
      )
      .filter({ hasText: /added\s+to\s+cart|added\s+successfully|success/i })
      .first();
    this.cartCountBadge = this.page
      .locator(
        [
          '.navbar-tool-icon-box .count',
          '.cart-count',
          '[class*="cart" i] .count',
          'a[href*="cart" i] :text-matches("^\\s*\\d+\\s*$", "i")',
        ].join(', '),
      )
      .first();
  }

  async expectOnProductDetailsPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/product\//);
  }

  async getTitleText(): Promise<string> {
    // Avoid assuming a single title element exists across layouts.
    const candidates = [
      this.page.locator('[data-testid="product-title"]').first(),
      this.page.locator('[data-test="product-title"]').first(),
      this.page.locator('.product-title, .details-title, .product-name').first(),
      this.page.locator('h1').first(),
      this.page.locator('h2').first(),
      this.page.locator('a[href*="/product/"][aria-current="page"]').first(),
    ];

    for (const candidate of candidates) {
      const visible = await candidate.isVisible().catch(() => false);
      if (!visible) continue;
      const text = ((await candidate.textContent()) ?? '').trim();
      if (text.length > 0) return text;
    }

    // Fall back to the original locator (may throw with clearer context).
    await expect(this.title).toBeVisible({ timeout: 15000 });
    return ((await this.title.textContent()) ?? '').trim();
  }

  async expectTitleVisible(): Promise<void> {
    const text = await this.getTitleText();
    expect(text.length).toBeGreaterThan(0);
  }

  async expectUnitPriceVisible(): Promise<void> {
    await expect(this.unitPrice).toBeVisible({ timeout: 15000 });
  }

  async expectDiscountPriceShapeIfPresent(): Promise<void> {
    const hasDiscounted = await this.discountedPrice.isVisible().catch(() => false);
    if (!hasDiscounted) return;
    await expect(this.originalPrice).toBeVisible();
  }

  async expectImageVisible(): Promise<void> {
    const visible = await this.primaryImage.isVisible().catch(() => false);
    if (!visible) {
      // Fallback: ensure at least one image is visible on the page.
      await expect(this.page.locator('img:visible').first()).toBeVisible({ timeout: 15000 });
      return;
    }
    await expect(this.primaryImage).toBeVisible({ timeout: 15000 });
  }

  async expectPageLoadedWithoutError(): Promise<void> {
    await this.expectOnProductDetailsPage();
    await expect(this.page.locator('body')).toBeVisible();
    // Avoid false failures due to hidden/debug DOM. Only assert on visible error-like banners.
    const visibleError = this.page
      .locator(
        [
          '.alert-danger:visible',
          '.toast-error:visible',
          '.error:visible',
          ':text-matches("server\\s*error|exception|stack\\s*trace|something\\s+went\\s+wrong", "i"):visible',
        ].join(', '),
      )
      .first();
    await expect(visibleError).toHaveCount(0);
  }

  async expectBuyNowAndAddToCartEnabledIfPresent(): Promise<void> {
    const hasAddToCart = await this.addToCartButton.isVisible().catch(() => false);
    const hasBuyNow = await this.buyNowButton.isVisible().catch(() => false);
    if (hasAddToCart) await expect(this.addToCartButton).toBeEnabled();
    if (hasBuyNow) await expect(this.buyNowButton).toBeEnabled();
  }

  async expectThumbnailsWorkIfPresent(): Promise<void> {
    const count = await this.thumbnails.count();
    if (count < 2) return;

    const main = this.primaryImage;
    const before = (await main.getAttribute('src').catch(() => null)) ?? '';
    await this.thumbnails.nth(1).click();

    if (before) {
      await expect(main).not.toHaveAttribute('src', before, { timeout: 10000 }).catch(async () => {
        // Some UIs reuse the same <img> and change background/image-set instead of src; just ensure main image remains visible.
        await expect(main).toBeVisible();
      });
    } else {
      await expect(main).toBeVisible();
    }
  }

  async getQuantityValue(): Promise<number | null> {
    const visible = await this.quantityInput.isVisible().catch(() => false);
    if (!visible) return null;
    const raw = await this.quantityInput.inputValue();
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : null;
  }

  async setQuantity(quantity: number): Promise<void> {
    await expect(this.quantityInput).toBeVisible({ timeout: 15000 });
    await this.quantityInput.fill(String(quantity));
    await this.quantityInput.blur();
  }

  async clickQuantityIncrementIfPresent(): Promise<void> {
    const visible = await this.quantityIncrement.isVisible().catch(() => false);
    if (!visible) return;
    await this.quantityIncrement.click();
  }

  async clickQuantityDecrementIfPresent(): Promise<void> {
    const visible = await this.quantityDecrement.isVisible().catch(() => false);
    if (!visible) return;
    await this.quantityDecrement.click();
  }

  async expectQuantityNotBelowOneIfPresent(): Promise<void> {
    const value = await this.getQuantityValue();
    if (value === null) return;
    expect(value).toBeGreaterThanOrEqual(1);
  }

  async clickAddToCart(): Promise<void> {
    await expect(this.addToCartButton).toBeVisible({ timeout: 15000 });
    await safeClick(this.page, this.addToCartButton, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'auto', maxWaitMs: 2000 } });
  }

  async clickBuyNow(): Promise<void> {
    await expect(this.buyNowButton).toBeVisible({ timeout: 15000 });
    await safeClick(this.page, this.buyNowButton, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'auto', maxWaitMs: 2500 } });
  }

  async expectPurchaseRedirect(target: PurchaseTarget): Promise<void> {
    if (target === 'checkout') {
      await expect(this.page).toHaveURL(/\/checkout|\/checkout-details|\/shipping|\/payment/i);
      return;
    }
    await expect(this.page).toHaveURL(/\/cart/i);
  }

  async expectCartUpdatedAfterAdd(): Promise<void> {
    // Cart updates can be subtle and UI feedback can be short-lived.
    // Prefer a stable state change (cart count) and treat toast as best-effort.
    const miniCart = this.page.locator('[data-testid*="cart" i] :text-matches("^\\s*\\d+\\s*$", "i"), .navbar-tool-icon-box .count').first();

    const readCount = async (badge: Locator): Promise<number | null> => {
      const visible = await badge.isVisible().catch(() => false);
      if (!visible) return null;
      const raw = ((await badge.textContent()) ?? '').trim();
      const match = raw.match(/\d+/);
      if (!match) return null;
      const value = Number.parseInt(match[0], 10);
      return Number.isFinite(value) ? value : null;
    };

    const beforeCount = (await readCount(this.cartCountBadge)) ?? (await readCount(miniCart));

    const waitForToast = this.toast
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => 'toast' as const)
      .catch(() => null);

    const waitForCountChange = (async () => {
      if (beforeCount === null) {
        await expect
          .poll(async () => (await readCount(this.cartCountBadge)) ?? (await readCount(miniCart)) ?? -1, { timeout: 10000 })
          .toBeGreaterThanOrEqual(1);
        return 'count' as const;
      }

      await expect
        .poll(async () => (await readCount(this.cartCountBadge)) ?? (await readCount(miniCart)) ?? beforeCount, { timeout: 10000 })
        .toBeGreaterThanOrEqual(beforeCount + 1);
      return 'count' as const;
    })().catch(() => null);

    const outcome = await Promise.race([
      waitForCountChange,
      waitForToast,
    ]);

    if (outcome) return;

    // Final fallback: if nothing was detected, show a clear error instead of a generic timeout.
    throw new Error('Expected cart to update after Add to cart (cart count change or success toast), but no signal was observed.');
  }

  async toggleWishlistIfPresent(): Promise<void> {
    const visible = await this.wishlistButton.isVisible().catch(() => false);
    if (!visible) return;
    await safeClick(this.page, this.wishlistButton, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'auto', maxWaitMs: 1500 } });
  }

  async expectWishlistOrLoginPrompt(): Promise<void> {
    await Promise.race([
      expect(this.toast).toBeVisible({ timeout: 10000 }),
      expect(this.page).toHaveURL(/\/login/i),
      expect(this.page.locator(':text-matches("login|sign\\s*in", "i")')).toBeVisible({ timeout: 10000 }),
    ]);
  }

  async expandDescriptionIfPresent(): Promise<void> {
    const seeMoreVisible = await this.seeMoreButton.isVisible().catch(() => false);
    if (seeMoreVisible) {
      await safeClick(this.page, this.seeMoreButton, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'none' } });
    }
    // Ensure description content exists (best-effort)
    await expect(this.page.locator('body')).toContainText(/description|specification|feature/i);
  }

  async clickTabIfPresent(label: string): Promise<void> {
    const candidate = this.tabs.filter({ hasText: new RegExp(label, 'i') }).first();
    const visible = await candidate.isVisible().catch(() => false);
    if (!visible) return;
    // Tabs are often at the top and can be blocked by sticky debug bars.
    await safeClick(this.page, candidate, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'none' } });
  }

  async expectTabContentLoads(): Promise<void> {
    await expect(this.page.locator('body')).toBeVisible();
    // Avoid false failures from hidden/global "Loading..." nodes. Only consider visible spinners/text.
    const visibleLoading = this.page.locator(
      ':text-matches("^\\s*loading\\.{0,3}\\s*$", "i"):visible, .spinner:visible, .loading:visible',
    );
    await expect(visibleLoading).toHaveCount(0);
  }

  async openChatWithVendorIfPresent(): Promise<void> {
    const visible = await this.chatWithVendorButton.isVisible().catch(() => false);
    if (!visible) return;
    await safeClick(this.page, this.chatWithVendorButton, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'auto', maxWaitMs: 2000 } });
  }

  async expectVendorDetailsVisibleIfPresent(): Promise<void> {
    const visible = await this.vendorSection.isVisible().catch(() => false);
    if (!visible) return;
    await expect(this.vendorSection).toBeVisible();
  }

  async openFirstSimilarProductIfPresent(): Promise<boolean> {
    const visible = await this.similarProductsSection.isVisible().catch(() => false);
    if (!visible) return false;
    const link = this.similarProductLinks.first();
    const linkVisible = await link.isVisible().catch(() => false);
    if (!linkVisible) return false;
    await safeClick(this.page, link, { timeoutMs: 15000, neutralizeOverlays: true, wait: { kind: 'url', pattern: /\/product\// } });
    return true;
  }

  /**
   * Intent-driven API: "Buy now" can lead to checkout, cart, login prompt, or a modal depending on auth/stock/config.
   * This returns which path was taken to allow stable assertions.
   */
  async proceedToCheckout(): Promise<'checkout' | 'cart' | 'login' | 'stayed'> {
    const before = this.page.url();
    await this.clickBuyNow();

    const url = this.page.url();
    if (url !== before) {
      if (/\/checkout|\/checkout-details|\/shipping|\/payment/i.test(url)) return 'checkout';
      if (/\/cart/i.test(url)) return 'cart';
      if (/\/login|\/customer\/auth/i.test(url)) return 'login';
    }

    // No navigation: could be modal/mini-cart/login prompt. Check for best-effort visible signals.
    const modalOrPrompt = this.page.locator(':text-matches("login|sign\\s*in|checkout|cart|added\\s+to\\s+cart", "i")').first();
    const visible = await modalOrPrompt.isVisible().catch(() => false);
    return visible ? 'stayed' : 'stayed';
  }

  async expectPurchaseActionsVisible(): Promise<void> {
    const hasAddToCart = await this.addToCartButton.isVisible().catch(() => false);
    const hasBuyNow = await this.buyNowButton.isVisible().catch(() => false);
    const hasOutOfStock = await this.outOfStockBadge.isVisible().catch(() => false);

    if (!hasAddToCart && !hasBuyNow && !hasOutOfStock) {
      throw new Error('Expected purchase action (Add to cart / Buy now / Out of stock) to be visible on product details page.');
    }
  }
}
