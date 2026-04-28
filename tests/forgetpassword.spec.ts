import { expect, test } from '@playwright/test';
import { ForgetPasswordPage } from '../src/pages/ForgetPasswordPage';
import { makeUsPhoneE164 } from '../src/utils/dataFactory';
import { loadFixture } from '../src/utils/fixtureLoader';

const authPhones = loadFixture<{
  forgotPasswordExisting: string;
}>('auth/phones.json');

test.describe('Forgot Password Tests', () => {
  test.beforeEach(async ({ page }) => {
    const forgetPasswordPage = new ForgetPasswordPage(page);
    await forgetPasswordPage.navigateToLogin();
  });

  test('forgot password sends a reset OTP for an existing phone number', async ({ page }) => {
    const forgetPasswordPage = new ForgetPasswordPage(page);

    await forgetPasswordPage.requestPasswordReset(authPhones.forgotPasswordExisting);

    await forgetPasswordPage.waitForVerificationPage();
    await expect(await forgetPasswordPage.waitForResetSentMessage(10000)).toContain(
      'Check your phone Password reset OTP sent',
    );
    await expect(page.getByText('We have sent a verification code to ******8899')).toBeVisible();
  });

  test('forgot password with a generated phone number shows reset confirmation', async ({ page }) => {
    const forgetPasswordPage = new ForgetPasswordPage(page);
    const phoneNumber = makeUsPhoneE164();

    await forgetPasswordPage.requestPasswordReset(phoneNumber);

    await forgetPasswordPage.waitForVerificationPage();
    await expect(await forgetPasswordPage.waitForResetSentMessage(10000)).toContain(
      'Check your phone Password reset OTP sent',
    );
    await forgetPasswordPage.expectMaskedPhoneSuffix(phoneNumber.slice(-4));
  });
});
