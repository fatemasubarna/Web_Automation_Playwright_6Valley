import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await this.waitForHomeReady();
  }

  async isFlashDealVisible(): Promise<boolean> {
    return this.page.locator('section.flash-deal').isVisible();
  }

  header(): Locator {
    return this.page.locator('header, .navbar, .header, .navbar-sticky').first();
  }

  logo(): Locator {
    return this.page.locator('a.navbar-brand, .navbar-brand a, a:has(img[alt*="logo" i])').first();
  }

  navMenuItems(): Locator {
    return this.header().locator('a[href]').filter({ hasText: /home|categor|brand|shop|contact/i });
  }

  searchInput(): Locator {
    return this.page.locator(
      'input[name="name"]:visible, input[placeholder*="search" i]:visible, input[type="search"]:visible, .search-bar-input:visible',
    ).first();
  }

  searchSubmitButton(): Locator {
    return this.page.locator('button:has-text("Search"), .search_button, button[type="submit"]').first();
  }

  loginOrRegisterLink(): Locator {
    return this.page
      .locator(
        'a[href*="/customer/auth/login"], a[href*="/customer/auth"], a[href*="/customer/auth/register"], a[href*="/login"], a[href*="/register"]',
      )
      .first();
  }

  cartIcon(): Locator {
    return this.page.locator('a[href*="/cart"], a.navbar-tool[href*="cart"], .fa-shopping-cart').first();
  }

  mainBanner(): Locator {
    return this.page.locator('.hero-slider, .banner, .hero, .carousel, .swiper, #bannerMain').first();
  }

  bannerSlides(): Locator {
    return this.page.locator('.carousel-item, .swiper-slide, .owl-item');
  }

  clickableBanner(): Locator {
    return this.mainBanner().locator('a[href]').first();
  }

  categoriesSection(): Locator {
    return this.page.locator('section:has-text("Category"), section:has-text("Categories"), .category-section').first();
  }

  categoryLinks(): Locator {
    return this.categoriesSection().locator('a[href]');
  }

  productCards(): Locator {
    return this.page.locator(
      '.product-single-hover, .product, .product-card, .grid-product, [data-testid*="product"]',
    );
  }

  featuredSection(): Locator {
    return this.page.locator('section:has-text("Featured"), section:has-text("Latest"), section:has-text("Deal")').first();
  }

  addToCartButtons(): Locator {
    return this.page.locator('button:has-text("Add to cart"), a:has-text("Add to cart"), .add-to-cart').first();
  }

  wishlistButtons(): Locator {
    return this.page.locator('button[aria-label*="wishlist" i], .wishlist, .fa-heart').first();
  }

  dealsSection(): Locator {
    return this.page.locator('section:has-text("Deal"), section:has-text("Flash Sale"), .flash-deal').first();
  }

  countdownTimer(): Locator {
    return this.page.locator('.countdown, [class*="countdown"], [id*="countdown"]').first();
  }

  vendorSection(): Locator {
    return this.page.locator('section:has-text("Vendor"), section:has-text("Shop"), section:has-text("Store")').first();
  }

  vendorLinks(): Locator {
    return this.vendorSection().locator('a[href]');
  }

  footer(): Locator {
    return this.page.locator('footer');
  }

  footerLinks(): Locator {
    return this.footer().locator('a[href]');
  }

  socialLinks(): Locator {
    return this.footer().locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="youtube"], a[href*="linkedin"]');
  }

  newsletterEmailInput(): Locator {
    return this.footer().locator('input[type="email"]').first();
  }

  newsletterSubmitButton(): Locator {
    return this.footer().locator('button:has-text("Subscribe"), button[type="submit"]').first();
  }

  async search(keyword: string): Promise<void> {
    await this.searchInput().fill(keyword);
    if (await this.searchSubmitButton().isVisible().catch(() => false)) {
      await this.searchSubmitButton().click();
    } else {
      await this.searchInput().press('Enter');
    }
    await this.page.waitForLoadState('domcontentloaded');
  }

  async waitForHomeReady(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.header().waitFor({ state: 'visible', timeout: 20000 });
  }

  async openLoginOrRegister(): Promise<void> {
    const directAuthLink = this.loginOrRegisterLink();
    if (await directAuthLink.isVisible().catch(() => false)) {
      await directAuthLink.click();
      return;
    }

    const accountIcon = this.page.locator('.navbar-tool-text, .navbar-tool-icon-box, .fa-user, i[class*="user"]').first();
    if (await accountIcon.isVisible().catch(() => false)) {
      await accountIcon.click();
    }

    const fallbackLink = this.page
      .locator('a[href*="/customer/auth/login"], a[href*="/customer/auth/register"], a[href*="/customer/auth"]')
      .first();
    await fallbackLink.click();
  }

  normalizeUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }

  isSameBaseUrl(currentUrl: string, expectedBase: string): boolean {
    return this.normalizeUrl(currentUrl) === this.normalizeUrl(expectedBase);
  }

  async searchResultCount(): Promise<number> {
    return this.productCards().count();
  }

  async hasNoResultsMessage(): Promise<boolean> {
    const msg = this.page.locator('text=/no result|not found|0 items|nothing found/i').first();
    return msg.isVisible().catch(() => false);
  }
}
