import { env } from '@/config/env.js';
import { Resend } from 'resend';
import { signupEmailTemplate } from '../shared/constants/email-templates/signup';
import { EMAIL_MESSAGES } from '../shared/constants/response-messages';

class EmailService {
  private readonly RESEND_API_KEY = env.RESEND_API_KEY;
  private readonly resend = new Resend(this.RESEND_API_KEY);

  async sendSignupEmail(to: string, name: string, verificationLink: string) {
    try {
      const result = await this.resend.emails.send({
        from: 'noreply@yourdomain.com',
        to,
        subject: signupEmailTemplate.subject,
        html: signupEmailTemplate.html(name, verificationLink),
        text: signupEmailTemplate.text(name, verificationLink),
      });

      if (result.error) {
        throw new Error(`${EMAIL_MESSAGES.SIGNUP_EMAIL.FAILED}: ${result.error.message}`);
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`${EMAIL_MESSAGES.EMAIL_SEND.FAILED}: ${error.message}`);
      }
      throw new Error(EMAIL_MESSAGES.SIGNUP_EMAIL.VERIFICATION_FAILED);
    }
  }
}

const emailService = new EmailService();
export default emailService;
