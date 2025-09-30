import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ISignupRequest, ISigninRequest } from '@/shared/types/user.types';
import ResponseBuilder from '@/utils/responseBuilder';

export const signin = typedAsyncHandler<Record<string, string>, ISigninRequest>(
  async (req, res) => {
    // Debug log
    console.log('Request body:', req.body);
    ResponseBuilder.success(res, null, 'Sign-in successful');
  }
);

export const signup = typedAsyncHandler<Record<string, string>, ISignupRequest>(
  async (req, res) => {
    const { email, fullName, avatarUrl } = req.body;

    const validatedData = {
      email,
      fullName,
      // Note: password and confirmPassword are validated but not returned
      avatarUrl,
    };

    ResponseBuilder.created(res, validatedData, 'Sign-up successful');
  }
);

export const logout = typedAsyncHandler(async (req, res) => {
  ResponseBuilder.success(res, null, 'Logout successful');
});
