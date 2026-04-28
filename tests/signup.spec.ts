import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { SignUpPage } from '../src/pages/SignUpPage';
import { BASE_URL } from '../src/utils/env';
import { makeCustomer, makeEmail, makePassword, makeUsPhoneNational } from '../src/utils/dataFactory';
import { loadFixture } from '../src/utils/fixtureLoader';

const signUpFixtures = loadFixture<{ existingEmail: string }>('signup/users.json');
const authPhones = loadFixture<{ existingSignupPhone: string }>('auth/phones.json');

test.describe('Signup Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();

    if (process.env.MANUAL_CAPTCHA !== '1') {
      await page.route('**/captcha**', (route) =>
        route.fulfill({ status: 200, body: JSON.stringify({ success: true }) }),
      );
    }
  });

  test('try to signup with existing email', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const customer = makeCustomer();
    await signUpPage.navigateTo();

    await signUpPage.fillForm({ ...customer, email: signUpFixtures.existingEmail });
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
    await signUpPage.navigateTo();

    await signUpPage.fillForm({ ...customer, phone: authPhones.existingSignupPhone });
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
      email: makeEmail('pw.signup'),
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

    await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 20000 });
  });

  test('try to sign up without giving any mandatory field data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigateTo();
    await signUpPage.checkTerms();

    await signUpPage.clickSubmit({ force: true });

    await signUpPage.expectOnSignUpPage();
    await signUpPage.expectValidationOrToast();
  });

  test('try to signup with without mandatory field data', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const customer = makeCustomer();

    await signUpPage.navigateTo();
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

  test('verify without check mark on terms and condition signup button is not active', async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    const customer = makeCustomer();

    await signUpPage.navigateTo();
    await signUpPage.fillForm(customer);

    await signUpPage.uncheckTermsIfChecked();
    const submit = await signUpPage.getSubmitButton();
    const isDisabled = await signUpPage.isSubmitDisabled();

    if (isDisabled) {
      await expect(submit).toBeDisabled();
      return;
    }

    await signUpPage.clickSubmit({ force: true });
    await signUpPage.expectOnSignUpPage();
    await signUpPage.expectValidationOrToast();
  });
});
