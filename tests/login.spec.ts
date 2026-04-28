import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../src/pages/LoginPage';
import { asEscapedUrlPattern, BASE_URL } from '../src/utils/env';
import { makeEmail } from '../src/utils/dataFactory';
import { loadFixture } from '../src/utils/fixtureLoader';

const storefrontUrlPattern = asEscapedUrlPattern(BASE_URL);
const loginUsers = loadFixture<{
  validCustomer: { identity: string; password: string };
  invalidPasswordCustomer: { identity: string; password: string };
}>('auth/loginUsers.json');
const authPhones = loadFixture<{
  otpExistingUser: string;
  otpNewUser: string;
}>('auth/phones.json');

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('try to login without any data', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.clickSignIn();

    await expect(page.locator('input[name="user_identity"]')).toBeFocused();
    await expect
      .poll(() => loginPage.getValidationMessage('input[name="user_identity"]'))
      .toContain('Please fill out this field');
  });

  test('login with valid credential redirects to the storefront', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(loginUsers.validCustomer.identity, loginUsers.validCustomer.password);

    await expect(page).toHaveURL(storefrontUrlPattern);
  });

  test('login with valid email and invalid password shows the credentials error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login(loginUsers.invalidPasswordCustomer.identity, loginUsers.invalidPasswordCustomer.password);

    await expect(await loginPage.waitForErrorMessage(/credential|match/i, 10000)).toContain(
      'Credentials doesnt match',
    );
  });

  test('check the password masking', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await expect.poll(() => loginPage.isPasswordMasked()).toBeTruthy();
  });

  test('remember me keeps the previous credentials after logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const identityInput = page.locator('input[name="user_identity"]');
    const passwordInput = page.locator('input[name="password"]');
    const userGreeting = page.locator('.navbar-tool-text', {
      hasText: 'Hello, Robert',
    });

    await identityInput.fill(loginUsers.validCustomer.identity);
    await passwordInput.fill(loginUsers.validCustomer.password);
    await page.getByLabel(/remember me/i).check({ force: true });
    await loginPage.clickSignIn();

    await expect(page).toHaveURL(storefrontUrlPattern);
    await expect(userGreeting).toBeVisible();
    await userGreeting.click();
    await page.getByRole('link', { name: /logout/i }).click();

    await expect(page).toHaveURL(/\/customer\/auth\/login/i);
    await expect(identityInput).toHaveValue(loginUsers.validCustomer.identity);
    await expect(passwordInput).toHaveValue(loginUsers.validCustomer.password);
  });
});

test.describe('OTP Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('new user, OTP login test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpInputs = page.locator('input.otp-field[name="opt-field[]"]');
    const nameInput = page.locator('#user-name');
    const fullName = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const email = makeEmail('pw.otp');

    await loginPage.openOtpLogin();
    await page.locator('input[placeholder="Enter phone number"], input[type="tel"]').first().fill(authPhones.otpNewUser);
    await loginPage.clickGetOtp();
    await loginPage.waitForOtpVerificationPage();

    for (let index = 0; index < 6; index += 1) {
      await otpInputs.nth(index).fill('123456'[index]);
    }

    await loginPage.clickVerifyOtp();

    await expect(page).toHaveURL(/\/update-info?/i);
    await nameInput.fill(fullName);
    await page.locator('input[name="email"], input[type="email"]').first().fill(email);
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page).toHaveURL(storefrontUrlPattern);
  });

  test('existing user, OTP login test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpInputs = page.locator('input.otp-field[name="opt-field[]"]');

    await loginPage.openOtpLogin();
    await page.locator('input[placeholder="Enter phone number"], input[type="tel"]').first().fill(authPhones.otpExistingUser);

    await loginPage.clickGetOtp();
    await loginPage.waitForOtpVerificationPage();
    for (let index = 0; index < 6; index += 1) {
      await otpInputs.nth(index).fill('123456'[index]);
    }

    await loginPage.clickVerifyOtp();
    await expect(page).toHaveURL(storefrontUrlPattern);
  });
});
