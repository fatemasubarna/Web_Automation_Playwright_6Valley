import { After, AfterAll, Before, BeforeAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { Browser, chromium } from '@playwright/test';
import { PageManager } from '../../pages/PageManager';
import { BASE_URL, DEFAULT_TIMEOUT_MS, HEADLESS } from '../../utils/env';
import { CustomWorld } from './world';

let browser: Browser;
let sharedContext: Awaited<ReturnType<Browser['newContext']>>;
let sharedPage: Awaited<ReturnType<typeof sharedContext.newPage>>;
setDefaultTimeout(DEFAULT_TIMEOUT_MS);

BeforeAll(async function () {
  browser = await chromium.launch({ headless: HEADLESS });
  sharedContext = await browser.newContext({ baseURL: BASE_URL });
  sharedPage = await sharedContext.newPage();
});

Before(async function (this: CustomWorld) {
  this.browser = browser;
  this.context = sharedContext;
  this.page = sharedPage;
  this.pages = new PageManager(this.page);

  // Backward-compatible aliases while migrating all tests to world.pages.*
  this.homePage = this.pages.homePage;
  this.loginPage = this.pages.loginPage;
  this.searchPage = this.pages.searchPage;
  this.signUpPage = this.pages.signUpPage;
  this.resetScenarioState();
});

After(async function (this: CustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED && this.page) {
    const image = await this.page.screenshot({ fullPage: true });
    this.attach(image, 'image/png');
  }

  await this.page.goto('about:blank');
});

AfterAll(async function () {
  await sharedContext?.close();
  await browser?.close();
});
