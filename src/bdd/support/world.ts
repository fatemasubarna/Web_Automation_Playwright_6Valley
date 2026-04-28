import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { PageManager } from '../../pages/PageManager';
import { SearchPage } from '../../pages/SearchPage';
import { SignUpPage } from '../../pages/SignUpPage';

export class CustomWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  pages!: PageManager;

  // Shared page objects
  homePage!: HomePage;
  loginPage!: LoginPage;
  searchPage!: SearchPage;
  signUpPage!: SignUpPage;
  generatedPhone?: string;
  generatedEmail?: string;
  generatedFullName?: string;
  lastErrorMessage?: string;

  constructor(options: IWorldOptions) {
    super(options);
  }

  resetScenarioState(): void {
    this.generatedPhone = undefined;
    this.generatedEmail = undefined;
    this.generatedFullName = undefined;
    this.lastErrorMessage = undefined;
  }
}

setWorldConstructor(CustomWorld);
