export enum LOGIN {
  SUCCESS = 'Login successful',
  FAILED = 'Login failed',
  INVALID_CREDENTIALS = 'Invalid email or password',
}

export enum SIGNUP {
  SUCCESS = 'Account created successfully',
  FAILED = 'Account creation failed',
  EMAIL_ALREADY_EXISTS = 'An account with this email already exists',
  PASSWORD_MISMATCH = 'Password and confirm password do not match',
}

export enum LOGOUT {
  SUCCESS = 'Logout successful',
  FAILED = 'Logout failed',
}

export enum TOKEN {
  REFRESH_SUCCESS = 'Tokens refreshed successfully',
  REFRESH_FAILED = 'Token refresh failed',
  INVALID = 'Invalid token',
}
