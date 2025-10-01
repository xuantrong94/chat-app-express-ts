import User, { IUserDocument } from '@/models/user.model';
import { AUTH_MESSAGES } from '@/shared/constants/response-messages';
import { ISignupRequest } from '@/shared/types/user.types';
import jwt, { SignOptions } from 'jsonwebtoken';
class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET ?? 'default_jwt_secret';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '24h';
  private readonly JWT_REFRESH_SECRET =
    process.env.JWT_REFRESH_SECRET ?? 'default_jwt_refresh_secret';
  private readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

  // generate token
  generateToken(user: IUserDocument): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      this.JWT_SECRET,
      {
        expiresIn: this.JWT_EXPIRES_IN,
      } as SignOptions
    );
  }

  // verify token
  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.JWT_SECRET) as JwtPayload;
  }

  // generate refresh token
  generateRefreshToken(user: IUserDocument): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      this.JWT_REFRESH_SECRET,
      {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      } as SignOptions
    );
  }

  // generate token pair
  generateTokenPair(user: IUserDocument): { accessToken: string; refreshToken: string } {
    const accessToken = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  // verify refresh token
  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, this.JWT_REFRESH_SECRET) as JwtPayload;
  }

  // refresh tokens
  async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const decoded = this.verifyRefreshToken(refreshToken);

      // Find the user
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new token pair
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokenPair(user);
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid refresh token');
    }
  }

  // login logic
  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new Error(AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS);
    }
    const { accessToken, refreshToken } = this.generateTokenPair(user);
    return { accessToken, refreshToken };
  }

  // signup logic
  async signup({
    email,
    password,
    confirmPassword,
    fullName,
    avatarUrl,
  }: ISignupRequest): Promise<{ accessToken: string; refreshToken: string }> {
    // Validate password confirmation
    if (password !== confirmPassword) {
      throw new Error(AUTH_MESSAGES.SIGNUP.PASSWORD_MISMATCH);
    }

    // Check if user already exists
    const userExists = await User.existsByEmail(email);
    if (userExists) {
      throw new Error(AUTH_MESSAGES.SIGNUP.EMAIL_ALREADY_EXISTS);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      fullName,
      avatarUrl,
    });

    // Generate token pair
    const { accessToken, refreshToken } = this.generateTokenPair(user);
    return { accessToken, refreshToken };
  }
}

const authService = new AuthService();

export default authService;

interface JwtPayload {
  id: string;
  email: string;
}
