import { z } from 'zod';
import { validate } from '@/middlewares/validation.js';
// Password validation schema with strict requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(/^(?=.*[@$!%*?&])/, 'Password must contain at least one special character (@$!%*?&)');

// Email validation schema
const emailSchema = z
  .email()
  .refine(val => !!val, { message: 'Please provide a valid email address' })
  .toLowerCase()
  .trim();

// Full name validation schema
const fullNameSchema = z
  .string()
  .min(2, 'Full name must be at least 2 characters long')
  .max(50, 'Full name must not exceed 50 characters')
  .trim()
  .regex(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces');

// Avatar URL validation schema (optional)
const avatarUrlSchema = z
  .url({ message: 'Please provide a valid URL for avatar' })
  .optional()
  .or(z.literal(''));

// Signin validation schema
export const signinValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

// Signup validation schema
export const signupValidationSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      fullName: fullNameSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
      avatarUrl: avatarUrlSchema,
    })
    .refine(data => data.password === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

// Update profile validation schema
export const updateProfileValidationSchema = z.object({
  body: z.object({
    fullName: fullNameSchema.optional(),
    avatarUrl: avatarUrlSchema,
  }),
});

// Change password validation schema
export const changePasswordValidationSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmNewPassword: z.string(),
    })
    .refine(data => data.newPassword === data.confirmNewPassword, {
      message: 'New passwords do not match',
      path: ['confirmNewPassword'],
    }),
});

// Convenience validation middlewares for common use cases
export const validateSignup = validate(signupValidationSchema);
export const validateSignin = validate(signinValidationSchema);
export const validateUpdateProfile = validate(updateProfileValidationSchema);
export const validateChangePassword = validate(changePasswordValidationSchema);
