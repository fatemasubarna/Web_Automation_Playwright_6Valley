import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto('/customer/auth/login', { waitUntil: 'domcontentloaded' });
  }

  async login(email: string, password: string): Promise<void> {
    const identityInput = this.page.locator('input[name="user_identity"]');
    const passwordInput = this.page.locator('input[name="password"]');

    await expect(identityInput).toBeVisible();
    await identityInput.fill(email);
    await passwordInput.fill(password);
    await this.clickSignIn();
  }

  async clickSignIn(): Promise<void> {
    await this.page.getByRole('button', { name: /^sign in$/i }).click();
  }

  async openForgotPassword(): Promise<void> {
    await this.page.getByRole('link', { name: /forgot password\?/i }).click();
    await expect(this.forgotPasswordPhoneInput).toBeVisible();
    await expect(this.sendOtpButton).toBeVisible();
  }

  async requestPasswordReset(phone: string): Promise<void> {
    await this.openForgotPassword();
    await this.forgotPasswordPhoneInput.fill(phone);
    await this.autofillDefaultCaptcha('default_recaptcha_id_customer_auth');
    await this.sendOtpButton.click();
  }

  async waitForPasswordResetVerificationPage(): Promise<void> {
    await this.page.waitForURL(/\/customer\/auth\/login\/verify-account.*action=.*cGFzc3dvcmQtcmVzZXQ/i);
    await expect(this.otpInputs.first()).toBeVisible();
    await expect(this.otpInputs).toHaveCount(6);
  }

  async openOtpLogin(): Promise<void> {
    await this.page.getByRole('link', { name: /otp sign in/i }).click();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.page.getByRole('button', { name: /get otp/i })).toBeVisible();
  }

  async getOtp(phone: string): Promise<void> {
    await this.openOtpLogin();
    await this.phoneInput.fill(phone);
    await this.phoneInput.blur();
    await this.waitForCaptchaToSettle();
    await this.clickGetOtp();
  }

  async clickGetOtp(): Promise<void> {
    await this.page.getByRole('button', { name: /get otp/i }).click();
  }

  async waitForOtpVerificationPage(): Promise<void> {
    await this.page.waitForURL(/\/customer\/auth\/login\/verify-account/i);
    await expect(this.otpInputs.first()).toBeVisible();
    await expect(this.otpInputs).toHaveCount(6);
  }

  async verifyOtp(otp: string): Promise<void> {
    await this.waitForOtpVerificationPage();
    for (let index = 0; index < Math.min(otp.length, 6); index += 1) {
      await this.otpInputs.nth(index).fill(otp[index]);
    }
    await this.clickVerifyOtp();
  }

  async clickVerifyOtp(): Promise<void> {
    await this.page.getByRole('button', { name: /verify/i }).click();
  }

  async loginWithInvalidCredentials(phone: string, password: string): Promise<string> {
    await this.login(phone, password);
    const errorMessage = await this.waitForErrorMessage(/credential|match|invalid|error/i);
    return errorMessage;
  }

  async getErrorMessage(): Promise<string> {
    return this.page.evaluate(() => {
      const selectors = [
        '#toast-container .toast-error',
        '#toast-container .toast',
        '.toast-error',
        '.toast',
        '[role="alert"]',
        '[role="status"]',
        '[aria-live="assertive"]',
        '[aria-live="polite"]',
        '.alert-danger',
        '.alert',
        '.invalid-feedback',
        '.text-danger',
        '.error',
        '.help-block',
      ];

      const messages = Array.from(document.querySelectorAll(selectors.join(', ')))
        .map((node) => (node.textContent ?? '').trim())
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join('\n');
      }

      const bodyText = document.body?.innerText ?? '';
      const matchingLine = bodyText
        .split('\n')
        .map((line) => line.trim())
        .find((line) => /credential|match|invalid|error/i.test(line));

      return matchingLine ?? '';
    });
  }

  async waitForErrorMessage(pattern: RegExp, timeout = 10000): Promise<string> {
    await expect
      .poll(async () => await this.getErrorMessage(), { timeout })
      .toMatch(pattern);

    return this.getErrorMessage();
  }

  async isPasswordMasked(): Promise<boolean> {
    const inputType = await this.page.getAttribute('input[name="password"]', 'type');
    return inputType === 'password';
  }

  async getValidationMessage(selector: string): Promise<string> {
    return this.page.locator(selector).evaluate((element) => {
      return (element as HTMLInputElement).validationMessage;
    });
  }

  private get phoneInput() {
    return this.page.locator('input[placeholder="Enter phone number"], input[type="tel"]').first();
  }

  private get forgotPasswordPhoneInput() {
    return this.page.locator('input[name="identity"]').first();
  }

  private get sendOtpButton() {
    return this.page.getByRole('button', { name: /send otp/i });
  }

  private get otpInputs() {
    return this.page.locator('input.otp-field[name="opt-field[]"]');
  }

  private async autofillDefaultCaptcha(sessionKey: string): Promise<void> {
    const captchaInput = this.page.locator('input[name="default_captcha_value"]');
    if (!(await captchaInput.isVisible().catch(() => false))) {
      return;
    }

    await this.page.evaluate((captchaSessionKey) => {
      const fillCaptcha = (window as typeof window & {
        getSessionRecaptchaCode?: (sessionKey: string, inputSelector: string) => void;
      }).getSessionRecaptchaCode;

      fillCaptcha?.(captchaSessionKey, 'input[name="default_captcha_value"]');
    }, sessionKey);

    await expect
      .poll(async () => {
        const value = await captchaInput.inputValue();
        return value.length > 0 && !/^\.+$/.test(value);
      })
      .toBeTruthy();
  }

  private async waitForCaptchaToSettle(): Promise<void> {
    const captchaInput = this.page.locator('input[name="default_captcha_value"]');
    if (!(await captchaInput.isVisible().catch(() => false))) {
      return;
    }

    await this.page.waitForFunction(() => {
      const input = document.querySelector('input[name="default_captcha_value"]') as HTMLInputElement | null;
      if (!input) {
        return false;
      }

      return input.value === '' || (input.value.length > 0 && !/^\.+$/.test(input.value));
    });
  }
}
