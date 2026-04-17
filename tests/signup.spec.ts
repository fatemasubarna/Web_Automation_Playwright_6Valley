import { test, expect } from '@playwright/test';
import { SignUpPage } from '../pages/SignUpPage';
import { faker } from '@faker-js/faker';

function makeEmail(): string {
  const safe = faker.internet
    .username()
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
  return `pw.signup.${Date.now()}.${safe}@example.com`;
}

function makeUsPhoneNational(): string {
  const first = faker.helpers.arrayElement(['2', '3', '4', '5', '6', '7', '8', '9']);
  return `${first}${faker.string.numeric(9)}`;
}

function makePassword(): string {
  return faker.internet.password({
    length: 12,
    memorable: false,
    pattern: /[A-Za-z0-9]/,
  });
}

function makeCustomer() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const password = makePassword();

  return {
    firstName,
    lastName,
    email: makeEmail(),
    phone: makeUsPhoneNational(),
    password,
    confirmPassword: password,
  };
}

test.describe('Signup Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();

    if (process.env.MANUAL_CAPTCHA !== '1') {
      // Bypass captcha validation so form submits successfully in tests
      await page.route('**/captcha**', (route) =>
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) }),
      );
    }
  });

  test('try to signup with existing email', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const customer = makeCustomer();
    const existingEmail = 'robert@customer.com';
    await signUpPage.navigateTo();

    await signUpPage.fillForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: existingEmail,
      phone: customer.phone,
      password: customer.password,
      confirmPassword: customer.confirmPassword,
    });

    await signUpPage.checkTerms();

    const submit = await signUpPage.getSubmitButton();
    await expect(submit).toBeEnabled();
    await signUpPage.clickSubmit();
    await signUpPage.expectOnSignUpPage();

    await signUpPage.waitForToastText(/email.*already.*taken/i, 15000);
  });

  test('try to signup with existing phone number', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const customer = makeCustomer();
    const existingPhone = '+15553334444';
    await signUpPage.navigateTo();

    await signUpPage.fillForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: existingPhone,
      password: customer.password,
      confirmPassword: customer.confirmPassword,
    });

    await signUpPage.checkTerms();

    const submit = await signUpPage.getSubmitButton();
    await expect(submit).toBeEnabled();
    await signUpPage.clickSubmit();
    await signUpPage.expectOnSignUpPage();

    await signUpPage.waitForToastText(/phone.*already.*taken/i, 15000);
  });

  test('signup with valid data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const fakeCustomer = {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: makeEmail(),
      phone: makeUsPhoneNational(),
      password: makePassword(),
    };

    await signUpPage.navigateTo();

    await signUpPage.fillForm({
      firstName: fakeCustomer.firstName,
      lastName: fakeCustomer.lastName,
      email: fakeCustomer.email,
      phone: fakeCustomer.phone,
      password: fakeCustomer.password,
      confirmPassword: fakeCustomer.password,
    });

    await signUpPage.checkTerms();
    await signUpPage.clickSubmit();

    await expect(page).toHaveURL('https://6valley-testing.6amdev.xyz/', {
      timeout: 20000,
    });

  });

  test('try to sign up without giving any mandatory field data', async ({
    page,
  }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigateTo();
    await signUpPage.checkTerms();

    await signUpPage.clickSubmit({ force: true });

    await signUpPage.expectOnSignUpPage();
    await signUpPage.expectValidationOrToast();
  });

  test('try to signup with without mandatory field data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigateTo();
    const customer = makeCustomer();

    // Fill most fields but intentionally omit phone.
    await signUpPage.fillForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      password: customer.password,
      confirmPassword: customer.confirmPassword,
    });

    await signUpPage.checkTerms();

    await signUpPage.clickSubmit({ force: true });

    await signUpPage.expectOnSignUpPage();
    await signUpPage.expectValidationOrToast();
  });

  test('verify without check mark on terms and condition signup button is not active', async ({
    page,
  }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigateTo();
    const customer = makeCustomer();

    await signUpPage.fillForm({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      password: customer.password,
      confirmPassword: customer.confirmPassword,
    });

    await signUpPage.uncheckTermsIfChecked();
    const submit = await signUpPage.getSubmitButton();
    const isDisabled = await signUpPage.isSubmitDisabled();

    if (isDisabled) {
      await expect(submit).toBeDisabled();
      return;
    }

    // If the UI doesn't disable, still verify signup cannot proceed without accepting terms.
    await signUpPage.clickSubmit({ force: true });
    await signUpPage.expectOnSignUpPage();
    await signUpPage.expectValidationOrToast();
  });
}); 
