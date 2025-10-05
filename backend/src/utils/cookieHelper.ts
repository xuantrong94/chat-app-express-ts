import { CookieOptions } from 'express';
import { env, isProduction } from '@/config/env';

// Extended cookie options interface to include sameSite
interface ExtendedCookieOptions extends CookieOptions {
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
}

/**
 * Cookie configuration helper
 */
export class CookieHelper {
  /**
   * Get base cookie options
   */
  private static getBaseCookieOptions(): ExtendedCookieOptions {
    return {
      httpOnly: env.COOKIE_HTTP_ONLY,
      secure: isProduction() ? true : env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
      path: '/',
    };
  }

  /**
   * Get cookie options for access token
   */
  static getAccessTokenCookieOptions(): ExtendedCookieOptions {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: env.COOKIE_ACCESS_TOKEN_EXPIRES,
    };
  }

  /**
   * Get cookie options for refresh token
   */
  static getRefreshTokenCookieOptions(): ExtendedCookieOptions {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: env.COOKIE_REFRESH_TOKEN_EXPIRES,
    };
  }

  /**
   * Get cookie options for clearing cookies
   */
  static getClearCookieOptions(): ExtendedCookieOptions {
    return {
      ...this.getBaseCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    };
  }
}

// Cookie names constants
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;
