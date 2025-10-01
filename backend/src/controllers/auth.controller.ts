import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import authService from '@/services/auth.service';
import { AUTH_MESSAGES } from '@/shared/constants/response-messages';
import { ISignupRequest, ISigninRequest } from '@/shared/types/user.types';
import ResponseBuilder from '@/utils/responseBuilder';
import { CookieHelper, COOKIE_NAMES } from '@/utils/cookieHelper';

export const signin = typedAsyncHandler<Record<string, string>, ISigninRequest>(
  async (req, res) => {
    // use service to handle login
    const { email, password } = req.body;

    const { accessToken, refreshToken } = await authService.login(email, password);

    // Set cookies for tokens
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, CookieHelper.getAccessTokenCookieOptions());
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      CookieHelper.getRefreshTokenCookieOptions()
    );

    ResponseBuilder.success(res, { message: 'Login successful' }, AUTH_MESSAGES.LOGIN.SUCCESS);
  }
);

export const signup = typedAsyncHandler<Record<string, string>, ISignupRequest>(
  async (req, res) => {
    // Use service to handle signup
    const signupData = req.body;

    const { accessToken, refreshToken } = await authService.signup(signupData);

    // Set cookies for tokens
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, CookieHelper.getAccessTokenCookieOptions());
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      CookieHelper.getRefreshTokenCookieOptions()
    );

    ResponseBuilder.success(
      res,
      { message: 'Account created successfully' },
      AUTH_MESSAGES.SIGNUP.SUCCESS
    );
  }
);

export const logout = typedAsyncHandler(async (req, res) => {
  // Clear authentication cookies
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, '', CookieHelper.getClearCookieOptions());
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, '', CookieHelper.getClearCookieOptions());

  ResponseBuilder.success(res, { message: 'Logout successful' }, 'Logout successful');
});

export const refreshToken = typedAsyncHandler(async (req, res) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

  if (!refreshToken) {
    ResponseBuilder.error(res, 'Refresh token not found', 401);
    return;
  }

  try {
    // Use auth service to refresh tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(refreshToken);

    // Set new cookies
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, CookieHelper.getAccessTokenCookieOptions());
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      newRefreshToken,
      CookieHelper.getRefreshTokenCookieOptions()
    );

    ResponseBuilder.success(res, { message: 'Tokens refreshed successfully' }, 'Tokens refreshed');
  } catch (error: unknown) {
    // Clear cookies if refresh token is invalid
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, '', CookieHelper.getClearCookieOptions());
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, '', CookieHelper.getClearCookieOptions());

    const errorMessage = error instanceof Error ? error.message : 'Invalid refresh token';
    ResponseBuilder.error(res, errorMessage, 401);
  }
});

// ===================================== //
// ========== TEST CONTROLLER ========== //
// ===================================== //

export const testCookie = typedAsyncHandler(async (req, res) => {
  // Just to test if cookies are being sent correctly
  const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
  const refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

  if (accessToken || refreshToken) {
    ResponseBuilder.success(res, { accessToken, refreshToken }, 'Cookies retrieved successfully');
  } else {
    ResponseBuilder.error(res, 'No auth cookies found', 404);
  }
});
