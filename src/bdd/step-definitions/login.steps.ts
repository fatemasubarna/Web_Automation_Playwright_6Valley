import { Given, Then, When } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { makeEmail, makeUsPhoneE164 } from '../../utils/dataFactory';
import { asEscapedUrlPattern, BASE_URL } from '../../utils/env';
import { loadFixture } from '../../utils/fixtureLoader';

const loginUsers = loadFixture<{
  validCustomer: { identity: string; password: string };
  invalidPasswordCustomer: { identity: string; password: string };
}>('auth/loginUsers.json');

const authPhones = loadFixture<{
  forgotPasswordExisting: string;
  otpExistingUser: string;
  otpNewUser: string;
}>('auth/phones.json');

const storefrontUrlPattern = asEscapedUrlPattern(BASE_URL);
const loginPage = (world: CustomWorld) => world.pages.loginPage;

Given('I am on the login page', async function (this: CustomWorld) {
  await loginPage(this).navigateTo();
});

When('I submit the login form without entering credentials', async function (this: CustomWorld) {
  await loginPage(this).clickSignIn();
});

When('I login with valid customer credentials', async function (this: CustomWorld) {
  await loginPage(this).login(loginUsers.validCustomer.identity, loginUsers.validCustomer.password);
});

When('I login with invalid password credentials', async function (this: CustomWorld) {
  await loginPage(this).login(
    loginUsers.invalidPasswordCustomer.identity,
    loginUsers.invalidPasswordCustomer.password,
  );
});

When('I login with remember me enabled', async function (this: CustomWorld) {
  await loginPage(this).loginWithRememberMe(loginUsers.validCustomer.identity, loginUsers.validCustomer.password);
});

When('I logout from the account menu', async function (this: CustomWorld) {
  await loginPage(this).openUserGreeting();
  await loginPage(this).logout();
});

When('I request password reset for an existing account phone', async function (this: CustomWorld) {
  await loginPage(this).requestPasswordReset(authPhones.forgotPasswordExisting);
});

When('I open the forgot password form', async function (this: CustomWorld) {
  await loginPage(this).openForgotPassword();
});

When('I request password reset with a generated phone number', async function (this: CustomWorld) {
  this.generatedPhone = makeUsPhoneE164();
  await loginPage(this).requestPasswordReset(this.generatedPhone);
});

When('I request OTP login for existing user', async function (this: CustomWorld) {
  await loginPage(this).getOtp(authPhones.otpExistingUser);
});

When('I request OTP login for new user', async function (this: CustomWorld) {
  await loginPage(this).getOtp(authPhones.otpNewUser);
});

When('I verify OTP code {string}', async function (this: CustomWorld, otpCode: string) {
  await loginPage(this).verifyOtp(otpCode);
});

When('I submit generated profile info', async function (this: CustomWorld) {
  this.generatedFullName = 'QA OTP User';
  this.generatedEmail = makeEmail('pw.otp');
  await loginPage(this).submitProfileUpdate(this.generatedFullName, this.generatedEmail);
});

Then('the password field should be masked', async function (this: CustomWorld) {
  await loginPage(this).expectPasswordFieldToBeMasked();
});

Then('I should see browser required validation on the identity field', async function (this: CustomWorld) {
  await loginPage(this).expectIdentityFieldRequiredValidation();
});

Then('I should be redirected to the storefront', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(storefrontUrlPattern);
});

Then('I should see a credentials error message', async function (this: CustomWorld) {
  this.lastErrorMessage = await loginPage(this).waitForErrorMessage(/credential|match/i, 10000);
  await expect(this.lastErrorMessage).toContain('Credentials doesnt match');
});

Then('I should see previous login credentials prefilled', async function (this: CustomWorld) {
  await expect(this.page).toHaveURL(/\/customer\/auth\/login/i);
  await loginPage(this).expectIdentityValue(loginUsers.validCustomer.identity);
  await loginPage(this).expectPasswordValue(loginUsers.validCustomer.password);
});

Then('I should land on password reset verification page', async function (this: CustomWorld) {
  await loginPage(this).waitForPasswordResetVerificationPage();
});

Then('I should see password reset OTP sent confirmation', async function (this: CustomWorld) {
  const message = await loginPage(this).waitForErrorMessage(/password reset otp sent/i, 10000);
  await expect(message).toContain('Check your phone Password reset OTP sent');
});

Then('I should see forgot password form fields', async function (this: CustomWorld) {
  // `openForgotPassword()` already validates required inputs/buttons are visible.
  await expect(this.page).toHaveURL(/\/customer\/auth\/recover-password/i);
});

Then('I should see the masked generated phone suffix', async function (this: CustomWorld) {
  const suffix = this.generatedPhone?.slice(-4);
  if (!suffix) {
    throw new Error('Generated phone number was not set in the test context.');
  }

  await loginPage(this).expectMaskedPhoneSuffix(suffix);
});
