export interface IUser {
  email: string;
  fullName: string;
  password: string;
  avatarUrl?: string;
}

// Signup request types
export interface ISignupRequest {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
}

// Signin request types
export interface ISigninRequest {
  email: string;
  password: string;
}

// Update profile request types
export interface IUpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

// Change password request types
export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Auth response types
export interface IAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// User profile response
export interface IUserProfileResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
