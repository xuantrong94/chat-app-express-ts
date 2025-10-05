import { COOKIE_NAMES, ResponseBuilder } from '@/utils';
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { AUTH_MESSAGES } from '@/shared/constants/response-messages';
import authService, { JwtPayload } from '@/services/auth.service';
import { AuthenticatedUser } from '@/shared/types';

export const protectRoute = typedAsyncHandler(async (req, res, next) => {
  const accessToken = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

  if (!accessToken) {
    ResponseBuilder.error(res, AUTH_MESSAGES.TOKEN.INVALID, 401);
    return;
  }

  try {
    const decoded: JwtPayload = authService.verifyToken(accessToken);

    // Attach user info to request object with proper typing
    const user: AuthenticatedUser = {
      id: decoded.id,
      email: decoded.email,
    };
    res.locals.user = user;
    next();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : AUTH_MESSAGES.TOKEN.INVALID;
    ResponseBuilder.error(res, errorMessage, 401);
    return;
  }
});
