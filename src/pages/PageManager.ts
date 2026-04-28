import type { Page } from '@playwright/test';
import { ForgetPasswordPage } from './ForgetPasswordPage';
import { HomePage } from './HomePage';
import { LoginPage } from './LoginPage';
import { SearchPage } from './SearchPage';
import { SignUpPage } from './SignUpPage';

export class PageManager {
  readonly forgetPasswordPage: ForgetPasswordPage;
  readonly homePage: HomePage;
  readonly loginPage: LoginPage;
  readonly searchPage: SearchPage;
  readonly signUpPage: SignUpPage;

  constructor(page: Page) {
    this.forgetPasswordPage = new ForgetPasswordPage(page);
    this.homePage = new HomePage(page);
    this.loginPage = new LoginPage(page);
    this.searchPage = new SearchPage(page);
    this.signUpPage = new SignUpPage(page);
  }
}
