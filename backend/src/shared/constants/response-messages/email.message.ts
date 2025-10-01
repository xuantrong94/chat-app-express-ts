export enum EMAIL_SEND {
  SUCCESS = 'Email sent successfully',
  FAILED = 'Failed to send email',
  INVALID_EMAIL = 'Invalid email address provided',
  SERVICE_UNAVAILABLE = 'Email service is currently unavailable',
  RATE_LIMITED = 'Too many email requests, please try again later',
}

export enum SIGNUP_EMAIL {
  SUCCESS = 'Welcome email sent successfully',
  FAILED = 'Failed to send welcome email',
  VERIFICATION_SENT = 'Verification email sent to your inbox',
  VERIFICATION_FAILED = 'Failed to send verification email',
  ALREADY_VERIFIED = 'Email address is already verified',
}

export enum EMAIL_VERIFICATION {
  SUCCESS = 'Email verified successfully',
  FAILED = 'Email verification failed',
  INVALID_TOKEN = 'Invalid or expired verification token',
  ALREADY_VERIFIED = 'Email address is already verified',
  TOKEN_EXPIRED = 'Verification token has expired',
  RESEND_SUCCESS = 'Verification email resent successfully',
  RESEND_FAILED = 'Failed to resend verification email',
}

export enum EMAIL_TEMPLATE {
  LOAD_FAILED = 'Failed to load email template',
  RENDER_FAILED = 'Failed to render email content',
  INVALID_TEMPLATE = 'Invalid email template configuration',
}

export enum EMAIL_CONFIG {
  MISSING_API_KEY = 'Email service API key is not configured',
  INVALID_CONFIG = 'Invalid email service configuration',
  CONNECTION_FAILED = 'Failed to connect to email service',
}
