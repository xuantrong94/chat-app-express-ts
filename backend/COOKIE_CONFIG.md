# Environment Configuration for Cookie Settings

## Cookie Configuration

Add these environment variables to your `.env` file:

```env
# Cookie Configuration
COOKIE_SECRET=your-32-character-cookie-secret-key
COOKIE_SECURE=false  # Set to true in production with HTTPS
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax  # Options: strict, lax, none
COOKIE_ACCESS_TOKEN_EXPIRES=900000   # 15 minutes in milliseconds
COOKIE_REFRESH_TOKEN_EXPIRES=604800000  # 7 days in milliseconds
```

## Production Settings

For production environments, ensure these security settings:

```env
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
NODE_ENV=production
```

## Cookie Names Used

- Access Token: `accessToken`
- Refresh Token: `refreshToken`

## Security Features

- **HttpOnly**: Prevents client-side JavaScript access to cookies
- **Secure**: Ensures cookies are only sent over HTTPS in production
- **SameSite**: Protects against CSRF attacks
- **Signed Cookies**: Uses cookie secret for integrity verification
- **Proper Expiration**: Different expiration times for access and refresh
  tokens
