import { expect, type Locator, Page } from '@playwright/test';

export class SignUpPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private signUpForm(): Locator {
    const firstName = this.page.getByPlaceholder(/ex:\s*jhone/i);
    const lastName = this.page.getByPlaceholder(/ex:\s*doe/i);
    return this.page
      .locator('form')
      .filter({ has: firstName })
      .filter({ has: lastName })
      .first();
  }

  async navigateTo(): Promise<void> {
    await this.page.goto('/customer/auth/sign-up', {
      waitUntil: 'domcontentloaded',
    });
    await this.expectOnSignUpPage();
  }

  async expectOnSignUpPage(): Promise<void> {
    await expect(this.page).toHaveURL(/\/customer\/auth\/sign-up/i);
    await expect(this.signUpForm()).toBeVisible({ timeout: 15000 });
  }

  private firstNameInput(): Locator {
    return this.signUpForm().getByPlaceholder(/ex:\s*jhone/i);
  }

  private lastNameInput(): Locator {
    return this.signUpForm().getByPlaceholder(/ex:\s*doe/i);
  }

  private emailInput(): Locator {
    return this.signUpForm().locator('input[type="email"]').first();
  }

  private phoneInput(): Locator {
    return this.signUpForm().getByPlaceholder(/enter phone number/i);
  }

  private captchaInput(): Locator {
    return this.page.getByPlaceholder(/enter captcha value/i).first();
  }

  async isCaptchaVisible(): Promise<boolean> {
    const captcha = this.captchaInput();
    return (await captcha.count()) > 0 && (await captcha.isVisible());
  }

  private async isCaptchaFilled(): Promise<boolean> {
    const captcha = this.captchaInput();
    if ((await captcha.count()) === 0) return true;
    if (!(await captcha.isVisible())) return true;
    return ((await captcha.inputValue()) ?? '').trim().length > 0;
  }

  async pauseForCaptchaIfPresent(): Promise<void> {
    if (process.env.MANUAL_CAPTCHA !== '1') return;
    if (!(await this.isCaptchaVisible())) return;
    if (await this.isCaptchaFilled()) return;

    await this.page.pause();

    if (!(await this.isCaptchaFilled())) {
      throw new Error(
        'Captcha is visible but still empty after resume. Fill the captcha input, then resume the test.',
      );
    }
  }

  private passwordInputs(): Locator {
    return this.signUpForm().locator('input[type="password"]');
  }

  toastError(): Locator {
    // Toasts can animate in/out and briefly be "not visible". We intentionally
    // do NOT include `:visible` here; rely on text-based waits instead.
    return this.page
      .locator(
        [
          // toastr
          '#toast-container .toast-error',
          '#toast-container .toast',
          '.toast-error',
          '.toast',

          // aria-live / role alerts (generic)
          '[role="alert"]',
          '[role="status"]',
          '[aria-live="assertive"]',
          '[aria-live="polite"]',

          // react-toastify
          '.Toastify__toast--error',
          '.Toastify__toast',

          // notyf
          '.notyf__toast--error',
          '.notyf__toast',

          // iziToast
          '.iziToast.iziToast-color-red',
          '.iziToast',

          // sweetalert2 (often used for errors instead of toasts)
          '.swal2-popup.swal2-icon-error',
          '.swal2-popup',
        ].join(', '),
      )
      .first();
  }

  toastText(): Locator {
    // Try to resolve the "message" node inside whichever toast container matched.
    return this.toastError()
      .locator(
        [
          '.toast-message',
          '.toast-body',
          '.Toastify__toast-body',
          '.notyf__message',
          '.iziToast-message',
          '.swal2-html-container',
          '[class*="message"]',
          '[class*="content"]',
        ].join(', '),
      )
      .first();
  }

  private async toastTextContent(): Promise<string> {
    return this.page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll(
          [
            '#toast-container .toast-error',
            '#toast-container .toast',
            '.toast-error',
            '.toast',
            '[role="alert"]',
            '[role="status"]',
            '[aria-live="assertive"]',
            '[aria-live="polite"]',
            '.Toastify__toast--error',
            '.Toastify__toast',
            '.notyf__toast--error',
            '.notyf__toast',
            '.iziToast.iziToast-color-red',
            '.iziToast',
            '.swal2-popup.swal2-icon-error',
            '.swal2-popup',
          ].join(', '),
        ),
      );

      const text = nodes
        .map((n) => (n.textContent ?? '').trim())
        .filter(Boolean)
        .join('\n');

      return text;
    });
  }

  async waitForToastText(re: RegExp, timeoutMs = 15000): Promise<string> {
    await expect
      .poll(async () => this.toastTextContent(), { timeout: timeoutMs })
      .toMatch(re);
    return this.toastTextContent();
  }

  private formValidationMessage(): Locator {
    // Some UIs render validation text in the DOM but keep it hidden. Avoid
    // `toBeVisible()` assertions for these messages.
    return this.signUpForm()
      .locator('.invalid-feedback, .text-danger, .error, .help-block, [role="alert"]')
      .filter({ hasText: /required|please|must|invalid|empty/i })
      .first();
  }

  async getSubmitButton(): Promise<Locator> {
    const form = this.signUpForm();

    const byId = form.locator('#sign-up:visible');
    if (await byId.count()) return byId.first();

    const byButtonId = form.locator('button#sign-up:visible');
    if (await byButtonId.count()) return byButtonId.first();

    const submit = form.locator('button[type="submit"]:visible');
    if (await submit.count()) return submit.first();

    return form
      .getByRole('button', { name: /sign up|register|create account/i })
      .first();
  }

  async getTermsCheckbox(): Promise<Locator> {
    const form = this.signUpForm();

    const byRole = form.getByRole('checkbox', {
      name: /terms|condition|privacy|policy|agree/i,
    });
    if (await byRole.count()) return byRole.first();

    const byLabelText = form
      .locator('label')
      .filter({ hasText: /terms|condition|privacy|policy|agree/i });
    if (await byLabelText.count()) {
      const label = byLabelText.first();
      const inLabel = label.locator('input[type="checkbox"]');
      if (await inLabel.count()) return inLabel.first();

      const forId = await label.getAttribute('for');
      if (forId) {
        const byFor = form.locator(`#${forId}:visible`);
        if (await byFor.count()) return byFor.first();
      }
    }

    return form.locator('input[type="checkbox"]:visible').first();
  }

  async fillForm(params: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }): Promise<void> {
    await this.page.waitForLoadState('networkidle');

    await expect(this.firstNameInput()).toBeVisible({ timeout: 15000 });

    if (params.firstName !== undefined)
      await this.firstNameInput().fill(params.firstName);
    if (params.lastName !== undefined) await this.lastNameInput().fill(params.lastName);
    if (params.email !== undefined) await this.emailInput().fill(params.email);
    if (params.phone !== undefined) {
      const normalized = params.phone.replace(/[^\d]/g, '');
      await this.phoneInput().fill(normalized);
    }

    if (params.password !== undefined)
      await this.passwordInputs().first().fill(params.password);
    if (params.confirmPassword !== undefined)
      await this.passwordInputs().nth(1).fill(params.confirmPassword);
  }

  async fillCaptchaIfPresent(value: string): Promise<void> {
    const captcha = this.captchaInput();
    if ((await captcha.count()) && (await captcha.isVisible())) {
      await captcha.fill(value);
    }
  }

  async checkTerms(): Promise<void> {
    const terms = await this.getTermsCheckbox();
    await terms.check({ force: true });
  }

  async uncheckTermsIfChecked(): Promise<void> {
    const terms = await this.getTermsCheckbox();
    if (await terms.isChecked()) await terms.uncheck({ force: true });
  }

  async pause(): Promise<void> {
    await this.page.pause();
  }

  async clickSubmit(options?: { force?: boolean }): Promise<void> {
    const submit = await this.getSubmitButton();
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeVisible({ timeout: 15000 });
    if (!options?.force) {
      await expect(submit).toBeEnabled({ timeout: 15000 });
    }
    await this.pauseForCaptchaIfPresent();
    await this.pause();
    await submit.click({ force: options?.force });
  }

  async isSubmitDisabled(): Promise<boolean> {
    const submit = await this.getSubmitButton();
    return submit.isDisabled();
  }

  async expectValidationOrToast(): Promise<void> {
    // Prefer toast if it appears; otherwise fall back to any inline validation.
    try {
      await this.waitForToastText(/required|please|must|invalid|empty|taken|exist/i, 5000);
      return;
    } catch {
      await expect(this.formValidationMessage()).toContainText(
        /required|please|must|invalid|empty/i,
        { timeout: 10000 },
      );
    }
  }

  async signUp(params: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
    acceptTerms?: boolean;
  }): Promise<void> {
    await this.fillForm({
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      phone: params.phone,
      password: params.password,
      confirmPassword: params.confirmPassword ?? params.password,
    });

    if (params.acceptTerms) {
      await this.checkTerms();
    }

    await this.clickSubmit();
  }

  // Backward-compatible alias for older call sites.
  async login(email: string, password: string): Promise<void> {
    await this.signUp({
      firstName: 'Test',
      lastName: 'User',
      email,
      phone: '01700000000',
      password,
      acceptTerms: true,
    });
  }
}
