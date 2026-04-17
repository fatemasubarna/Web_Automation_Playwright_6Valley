import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../pages/LoginPage';

const storefrontUrl = process.env.BASE_URL || 'https://6valley-testing.6amdev.xyz';
const storefrontUrlPattern = new RegExp(`^${storefrontUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?$`);

const makeUsPhoneNumber = (): string => {
  const areaCode = faker.number.int({ min: 200, max: 999 }).toString();
  const prefix = faker.number.int({ min: 200, max: 999 }).toString();
  const lineNumber = faker.number.int({ min: 1000, max: 9999 }).toString();

  return `+1${areaCode}${prefix}${lineNumber}`;
};

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

    await loginPage.login('robert@customer.com', '12345678');

    await expect(page).toHaveURL(storefrontUrlPattern);
  });

  test('login with valid email and invalid password shows the credentials error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.login('taylor@customer.com', '12345600');

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

    await identityInput.fill('robert@customer.com');
    await passwordInput.fill('12345678');
    await page.getByLabel(/remember me/i).check({ force: true });
    await loginPage.clickSignIn();

    await expect(page).toHaveURL(storefrontUrlPattern);
    await expect(userGreeting).toBeVisible();
    await userGreeting.click();
    await page.getByRole('link', { name: /logout/i }).click();

    await expect(page).toHaveURL(/\/customer\/auth\/login/i);
    await expect(identityInput).toHaveValue('robert@customer.com');
    await expect(passwordInput).toHaveValue('12345678');
  });
});

test.describe('Forgot Password Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('forgot password sends a reset OTP for an existing phone number', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.requestPasswordReset('+15556768899');

    await loginPage.waitForPasswordResetVerificationPage();
    await expect(await loginPage.waitForErrorMessage(/password reset otp sent/i, 10000)).toContain(
      'Check your phone Password reset OTP sent',
    );
    await expect(page.getByText('We have sent a verification code to ******8899')).toBeVisible();
  });

  test('forgot password with a faker-generated phone shows the current reset message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const phoneNumber = makeUsPhoneNumber();

    await loginPage.requestPasswordReset(phoneNumber);

    await loginPage.waitForPasswordResetVerificationPage();
    await expect(await loginPage.waitForErrorMessage(/password reset otp sent/i, 10000)).toContain(
      'Check your phone Password reset OTP sent',
    );
    await expect(page.getByText(new RegExp(`\\*{6}${phoneNumber.slice(-4)}`))).toBeVisible();
  });
});

test.describe('OTP Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test('onew user, OTP login `test', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const otpInputs = page.locator('input.otp-field[name="opt-field[]"]');
    const nameInput = page.locator('#user-name');
    const fullName = `${faker.person.firstName()} ${faker.person.lastName()}`;
    const email = `pw.otp.${Date.now()}.${faker.internet.username().replace(/[^a-z0-9]/gi, '').toLowerCase()}@example.com`;

    await loginPage.openOtpLogin();
    await page.locator('input[placeholder="Enter phone number"], input[type="tel"]').first().fill('2015550123');
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


   test('existing user, OTP login `test', async ({ page }) => {
   const loginPage = new LoginPage(page);
   const otpInputs = page.locator('input.otp-field[name="opt-field[]"]');

   await loginPage.openOtpLogin();
    await page.locator('input[placeholder="Enter phone number"], input[type="tel"]').first().fill('+15551112222');

     await loginPage.clickGetOtp();
     await loginPage.waitForOtpVerificationPage();
     for (let index = 0; index < 6; index += 1) {
     await otpInputs.nth(index).fill('123456'[index])
      };
  await loginPage.clickVerifyOtp();
  await expect(page).toHaveURL(storefrontUrlPattern);

   });


});
