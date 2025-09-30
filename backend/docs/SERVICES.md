# Service Layer Patterns

## Overview

The service layer contains the business logic of the application. Services are
responsible for implementing complex operations, coordinating between different
data sources, and maintaining business rules. They act as an intermediary
between controllers and data models.

## Service Architecture

### Responsibilities

1. **Business Logic** - Implement complex business rules and workflows
2. **Data Orchestration** - Coordinate operations across multiple models
3. **External Integrations** - Handle third-party API calls
4. **Data Transformation** - Convert between different data formats
5. **Transaction Management** - Ensure data consistency across operations
6. **Caching** - Implement caching strategies for performance

### Service Flow

```
Controller → Service → Model/Database
     ↑         ↓
Response ← Business Logic → External APIs
```

## Base Service Pattern

### 1. Service Structure

Every service follows this basic structure:

```typescript
import { Model } from '@/models';
import { ICreateRequest, IUpdateRequest, IResponse } from '@/shared/types';
import { AppError } from '@/utils/AppError';
import logger from '@/config/logger';

class ServiceName {
  // Create operations
  async create(data: ICreateRequest): Promise<IResponse> {
    // 1. Validate business rules
    // 2. Transform data if needed
    // 3. Perform database operations
    // 4. Handle related operations
    // 5. Return formatted response
  }

  // Read operations
  async findById(id: string): Promise<IResponse | null> {
    // Implementation
  }

  async findMany(filters: any): Promise<IResponse[]> {
    // Implementation
  }

  // Update operations
  async update(id: string, data: IUpdateRequest): Promise<IResponse | null> {
    // Implementation
  }

  // Delete operations
  async delete(id: string): Promise<void> {
    // Implementation
  }

  // Business-specific methods
  async performBusinessOperation(params: any): Promise<any> {
    // Implementation
  }
}

export default new ServiceName();
```

### 2. Singleton Pattern

Services are exported as singletons to maintain state and avoid unnecessary
instantiation:

```typescript
// Export as singleton
export default new UserService();

// Or use class with static methods for stateless services
class UtilityService {
  static async performUtility(data: any): Promise<any> {
    // Implementation
  }
}

export default UtilityService;
```

## Creating Services

### 1. User Service Example

```typescript
// src/services/user.service.ts
import bcrypt from 'bcrypt';
import { User, IUserDocument } from '@/models/user.model';
import {
  ICreateUserRequest,
  IUpdateUserRequest,
  IUserResponse,
  IPaginationOptions,
  IPaginatedResponse,
} from '@/shared/types';
import { AppError } from '@/utils/AppError';
import logger from '@/config/logger';

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData: ICreateUserRequest): Promise<IUserResponse> {
    try {
      // 1. Check if user already exists
      const existingUser = await User.findOne({
        email: userData.email.toLowerCase(),
      });

      if (existingUser) {
        throw AppError.conflict('User with this email already exists');
      }

      // 2. Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // 3. Create user
      const user = await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
      });

      // 4. Transform to response format (exclude sensitive data)
      return this.transformToResponse(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUserResponse | null> {
    try {
      const user = await User.findById(id);
      return user ? this.transformToResponse(user) : null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw AppError.internal('Error retrieving user');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUserDocument | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw AppError.internal('Error retrieving user');
    }
  }

  /**
   * Get paginated users
   */
  async getUsers(
    options: IPaginationOptions
  ): Promise<IPaginatedResponse<IUserResponse>> {
    try {
      const { page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      // Build search query
      const query: any = {};
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password') // Exclude password
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        User.countDocuments(query),
      ]);

      return {
        data: users.map(user => this.transformToResponse(user)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw AppError.internal('Error retrieving users');
    }
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    updateData: IUpdateUserRequest
  ): Promise<IUserResponse | null> {
    try {
      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );

      const user = await User.findByIdAndUpdate(
        id,
        { ...cleanData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      return user ? this.transformToResponse(user) : null;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw AppError.internal('Error updating user');
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );

      if (!user) {
        throw AppError.notFound('User not found');
      }
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw AppError.notFound('User not found');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        throw AppError.badRequest('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Transform database document to response format
   */
  private transformToResponse(user: IUserDocument): IUserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Validate user exists and is active
   */
  async validateUserExists(id: string): Promise<IUserDocument> {
    const user = await User.findById(id);
    if (!user || user.isDeleted) {
      throw AppError.notFound('User not found');
    }
    return user;
  }
}

export default new UserService();
```

### 2. Authentication Service

```typescript
// src/services/auth.service.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  ISignupRequest,
  ISigninRequest,
  IAuthResponse,
  ITokenPair,
} from '@/shared/types';
import { User } from '@/models/user.model';
import UserService from './user.service';
import { AppError } from '@/utils/AppError';
import { env } from '@/config/env';
import logger from '@/config/logger';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData: ISignupRequest): Promise<IAuthResponse> {
    try {
      // Create user through UserService
      const user = await UserService.createUser(userData);

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      return {
        user,
        tokens,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      // Find user with password
      const user = await UserService.findByEmail(email);
      if (!user) {
        throw AppError.unauthorized('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw AppError.unauthorized('Invalid credentials');
      }

      // Check if account is active
      if (user.isDeleted) {
        throw AppError.unauthorized('Account is deactivated');
      }

      // Update last login
      await User.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
      });

      // Generate tokens
      const tokens = this.generateTokens(user._id.toString());

      // Transform user to response format
      const userResponse = {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
      };

      return {
        user: userResponse,
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<ITokenPair> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;

      // Check if user still exists
      const user = await UserService.findById(decoded.id);
      if (!user) {
        throw AppError.unauthorized('User no longer exists');
      }

      // Generate new tokens
      return this.generateTokens(user.id);
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw AppError.unauthorized('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      // In a production app, you'd store refresh tokens in database
      // and remove them on logout. For now, we'll just log the action.
      logger.info('User logged out', {
        refreshToken: this.hashToken(refreshToken),
      });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(userId: string): ITokenPair {
    const accessToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify access token
   */
  async verifyAccessToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
      throw AppError.unauthorized('Invalid or expired token');
    }
  }

  /**
   * Hash token for logging purposes
   */
  private hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Generate password reset token
   */
  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await UserService.findByEmail(email);
      if (!user) {
        // Don't reveal if user exists
        throw AppError.notFound(
          'If this email exists, you will receive a reset link'
        );
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Store hashed token in database with expiration
      await User.findByIdAndUpdate(user._id, {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      return resetToken;
    } catch (error) {
      logger.error('Password reset token generation error:', error);
      throw error;
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      });

      if (!user) {
        throw AppError.badRequest('Token is invalid or has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password and clear reset token
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
        updatedAt: new Date(),
      });
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }
}

export default new AuthService();
```

### 3. Message Service Example

```typescript
// src/services/message.service.ts
import { Message, IMessageDocument } from '@/models/message.model';
import {
  ISendMessageRequest,
  IMessageResponse,
  IConversationResponse,
} from '@/shared/types';
import UserService from './user.service';
import { AppError } from '@/utils/AppError';
import logger from '@/config/logger';

class MessageService {
  /**
   * Send a message
   */
  async sendMessage(
    messageData: ISendMessageRequest & { senderId: string }
  ): Promise<IMessageResponse> {
    try {
      const { senderId, receiverId, content } = messageData;

      // Validate users exist
      await Promise.all([
        UserService.validateUserExists(senderId),
        UserService.validateUserExists(receiverId),
      ]);

      // Create message
      const message = await Message.create({
        senderId,
        receiverId,
        content: content.trim(),
        sentAt: new Date(),
      });

      return this.transformToResponse(message);
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get user's messages in a conversation
   */
  async getConversationMessages(
    userId: string,
    otherUserId: string,
    options: { page?: number; limit?: number; before?: Date } = {}
  ): Promise<IMessageResponse[]> {
    try {
      const { page = 1, limit = 50, before } = options;
      const skip = (page - 1) * limit;

      // Build query for conversation between two users
      const query: any = {
        $or: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: false,
      };

      // Add timestamp filter for pagination
      if (before) {
        query.sentAt = { $lt: before };
      }

      const messages = await Message.find(query)
        .sort({ sentAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'fullName avatarUrl')
        .populate('receiverId', 'fullName avatarUrl');

      return messages.map(message => this.transformToResponse(message));
    } catch (error) {
      logger.error('Error getting conversation messages:', error);
      throw AppError.internal('Error retrieving messages');
    }
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<IConversationResponse[]> {
    try {
      // Get latest message for each conversation
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [{ senderId: userId }, { receiverId: userId }],
            isDeleted: false,
          },
        },
        {
          $addFields: {
            otherUserId: {
              $cond: {
                if: { $eq: ['$senderId', userId] },
                then: '$receiverId',
                else: '$senderId',
              },
            },
          },
        },
        {
          $sort: { sentAt: -1 },
        },
        {
          $group: {
            _id: '$otherUserId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: {
                  if: {
                    $and: [
                      { $eq: ['$receiverId', userId] },
                      { $eq: ['$isRead', false] },
                    ],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'otherUser',
          },
        },
        {
          $unwind: '$otherUser',
        },
        {
          $sort: { 'lastMessage.sentAt': -1 },
        },
      ]);

      return conversations.map(conv => ({
        userId: conv.otherUser._id.toString(),
        user: {
          id: conv.otherUser._id.toString(),
          fullName: conv.otherUser.fullName,
          avatarUrl: conv.otherUser.avatarUrl,
        },
        lastMessage: {
          id: conv.lastMessage._id.toString(),
          content: conv.lastMessage.content,
          sentAt: conv.lastMessage.sentAt.toISOString(),
          isRead: conv.lastMessage.isRead,
        },
        unreadCount: conv.unreadCount,
      }));
    } catch (error) {
      logger.error('Error getting user conversations:', error);
      throw AppError.internal('Error retrieving conversations');
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          receiverId: userId, // Only receiver can mark as read
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      if (!message) {
        throw AppError.notFound('Message not found or already read');
      }
    } catch (error) {
      logger.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await Message.findOneAndUpdate(
        {
          _id: messageId,
          senderId: userId, // Only sender can delete
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        }
      );

      if (!message) {
        throw AppError.notFound('Message not found or unauthorized');
      }
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Transform message document to response format
   */
  private transformToResponse(message: IMessageDocument): IMessageResponse {
    return {
      id: message._id.toString(),
      content: message.content,
      senderId: message.senderId.toString(),
      receiverId: message.receiverId.toString(),
      sentAt: message.sentAt.toISOString(),
      isRead: message.isRead,
      readAt: message.readAt?.toISOString(),
    };
  }
}

export default new MessageService();
```

## Service Best Practices

### 1. Error Handling

- Always wrap operations in try-catch blocks
- Log errors with appropriate context
- Throw meaningful AppError instances
- Don't catch errors unless you can handle them

### 2. Data Validation

- Validate business rules in services, not just input validation
- Check for data consistency and relationships
- Validate permissions and ownership

### 3. Transaction Management

```typescript
// Example of transaction handling
async createUserWithProfile(userData: ICreateUserRequest): Promise<IUserResponse> {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create user
    const user = await User.create([userData], { session });

    // Create user profile
    await UserProfile.create([{
      userId: user[0]._id,
      preferences: defaultPreferences,
    }], { session });

    await session.commitTransaction();

    return this.transformToResponse(user[0]);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### 4. Caching Strategies

```typescript
// Example with caching
private cache = new Map<string, { data: any; expiry: number }>();

async getPopularUsers(): Promise<IUserResponse[]> {
  const cacheKey = 'popular_users';
  const cached = this.cache.get(cacheKey);

  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const users = await User.find({ isPopular: true })
    .sort({ followerCount: -1 })
    .limit(10);

  const result = users.map(user => this.transformToResponse(user));

  // Cache for 5 minutes
  this.cache.set(cacheKey, {
    data: result,
    expiry: Date.now() + 5 * 60 * 1000,
  });

  return result;
}
```

### 5. Service Composition

```typescript
// Services can use other services
class NotificationService {
  async sendWelcomeEmail(userId: string): Promise<void> {
    // Get user data from UserService
    const user = await UserService.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    // Send email using EmailService
    await EmailService.send({
      to: user.email,
      template: 'welcome',
      data: { fullName: user.fullName },
    });
  }
}
```

### 6. Interface Segregation

Create focused service interfaces:

```typescript
// Instead of one large UserService, split by concern
class UserAuthService {
  async authenticate(email: string, password: string): Promise<IUser> {
    // Authentication logic
  }
}

class UserProfileService {
  async updateProfile(
    userId: string,
    data: IUpdateProfileRequest
  ): Promise<IUserResponse> {
    // Profile management logic
  }
}

class UserPreferencesService {
  async updatePreferences(
    userId: string,
    preferences: IUserPreferences
  ): Promise<void> {
    // Preferences logic
  }
}
```

This service layer pattern ensures clean separation of business logic,
maintainable code, and consistent error handling across the application.
