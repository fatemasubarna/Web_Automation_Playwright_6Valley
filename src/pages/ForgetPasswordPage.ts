import { expect, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ForgetPasswordPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToLogin(): Promise<void> {
    await this.goto('/customer/auth/login');
  }

  async openForm(): Promise<void> {
    await this.page.getByRole('link', { name: /forgot password\?/i }).click();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.sendOtpButton).toBeVisible();
  }

  async requestPasswordReset(phone: string): Promise<void> {
    await this.openForm();
    await this.phoneInput.fill(phone);
    await this.autofillDefaultCaptcha('default_recaptcha_id_customer_auth');
    await this.sendOtpButton.click();
  }

  async waitForVerificationPage(): Promise<void> {
    await this.page.waitForURL(/\/customer\/auth\/login\/verify-account.*action=.*cGFzc3dvcmQtcmVzZXQ/i);
    await expect(this.otpInputs.first()).toBeVisible();
    await expect(this.otpInputs).toHaveCount(6);
  }

  async waitForResetSentMessage(timeout = 10000): Promise<string> {
    await expect.poll(async () => this.getErrorMessage(), { timeout }).toMatch(/password reset otp sent/i);
    return this.getErrorMessage();
  }

  async expectMaskedPhoneSuffix(suffix: string): Promise<void> {
    await expect(this.page.getByText(new RegExp(`\\*{6}${suffix}`))).toBeVisible();
  }

  private async getErrorMessage(): Promise<string> {
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
        .find((line) => /password reset otp sent|error|invalid/i.test(line));

      return matchingLine ?? '';
    });
  }

  private get phoneInput() {
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
}
