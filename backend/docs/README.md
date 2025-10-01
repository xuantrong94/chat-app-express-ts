# Developer Documentation Index

## 📚 Complete Developer Guide

Welcome to the chat app backend documentation! This comprehensive guide will
help you understand the project structure, patterns, and conventions used
throughout the codebase.

## 🚀 Start Here

### New to the Project?

1. **[Quick Start Guide](./QUICK_START.md)** - Get up and running in minutes
2. **[Developer Overview](./DEVELOPER.md)** - Understand the architecture and
   project structure

### Core Concepts

3. **[Type System Guide](./TYPE_SYSTEM.md)** - Master TypeScript types and
   conventions
4. **[Middleware Patterns](./MIDDLEWARE.md)** - Learn middleware creation and
   usage
5. **[Controller Patterns](./CONTROLLERS.md)** - Handle HTTP requests properly
6. **[Service Layer](./SERVICES.md)** - Implement business logic effectively

## 🏗️ Architecture Overview

This project follows a **layered architecture** with clear separation of
concerns:

```
┌─────────────────────────────────────────────────┐
│                   HTTP Layer                    │
│  Routes → Middleware → Controllers → Response   │
├─────────────────────────────────────────────────┤
│                 Business Layer                  │
│       Services → Domain Logic → Validation     │
├─────────────────────────────────────────────────┤
│                  Data Layer                     │
│         Models → Database → External APIs       │
└─────────────────────────────────────────────────┘
```

## 📖 Documentation Structure

### Core Documentation

- **[DEVELOPER.md](./DEVELOPER.md)** - Main developer guide with project
  overview
- **[QUICK_START.md](./QUICK_START.md)** - Fast setup and first steps

### Detailed Guides

- **[TYPE_SYSTEM.md](./TYPE_SYSTEM.md)** - TypeScript patterns and conventions
- **[MIDDLEWARE.md](./MIDDLEWARE.md)** - Middleware creation and usage patterns
- **[CONTROLLERS.md](./CONTROLLERS.md)** - HTTP handling and response patterns
- **[SERVICES.md](./SERVICES.md)** - Business logic and service layer patterns
- **[ENV_USAGE.md](./ENV_USAGE.md)** - Environment configuration usage guide
- **[ENV_QUICK_REFERENCE.md](./ENV_QUICK_REFERENCE.md)** - Environment variables
  quick reference

## 🎯 Quick Navigation

### By Role

- **New Developer**: Start with [Quick Start](./QUICK_START.md)
- **Backend Developer**: Read [Developer Guide](./DEVELOPER.md) and
  [Service Layer](./SERVICES.md)
- **Frontend Developer**: Focus on [Type System](./TYPE_SYSTEM.md) and
  [Controllers](./CONTROLLERS.md)
- **DevOps/Infrastructure**: Check [Developer Guide](./DEVELOPER.md) for
  environment setup

### By Task

- **Adding a new API endpoint**: [Controllers](./CONTROLLERS.md) →
  [Services](./SERVICES.md)
- **Creating middleware**: [Middleware Patterns](./MIDDLEWARE.md)
- **Defining types**: [Type System](./TYPE_SYSTEM.md)
- **Understanding project structure**: [Developer Guide](./DEVELOPER.md)
- **Configuring environment**: [Environment Usage](./ENV_USAGE.md) or
  [Environment Quick Reference](./ENV_QUICK_REFERENCE.md)

## 🛠️ Key Technologies

- **Runtime**: Node.js 18+ with ES Modules
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod schemas
- **Authentication**: JWT tokens
- **Logging**: Winston
- **Package Manager**: pnpm

## 📋 Development Workflow

### Typical Feature Development Flow

1. **Types First** - Define interfaces in `src/shared/types/`
2. **Database Model** - Create Mongoose model in `src/models/`
3. **Validation** - Add Zod schema in `src/validators/`
4. **Service Layer** - Implement business logic in `src/services/`
5. **Controller** - Handle HTTP in `src/controllers/`
6. **Routes** - Register endpoints in `src/routes/`
7. **Test** - Verify functionality

### Code Quality Standards

- **Type Safety**: Use TypeScript strictly, avoid `any`
- **Error Handling**: Use `AppError` for business errors
- **Validation**: Validate all inputs with Zod schemas
- **Logging**: Log important operations and errors
- **Response Format**: Use `ResponseBuilder` consistently

## 🎨 Code Patterns

### Controllers

```typescript
export const createResource = typedAsyncHandler<
  { id: string }, // URL params
  ICreateRequest, // Request body
  { include?: string } // Query params
>(async (req, res) => {
  const result = await SomeService.create(req.body);
  ResponseBuilder.created(res, result, 'Resource created successfully');
});
```

### Services

```typescript
class ResourceService {
  async create(data: ICreateRequest): Promise<IResourceResponse> {
    // 1. Validate business rules
    // 2. Transform data
    // 3. Save to database
    // 4. Return formatted response
  }
}

export default new ResourceService();
```

### Middleware

```typescript
export const customMiddleware = asyncHandler(async (req, res, next) => {
  // 1. Perform checks
  // 2. Modify request if needed
  // 3. Call next() or throw error
});
```

## 🚦 Best Practices

### Do's ✅

- Use `typedAsyncHandler` for type-safe controllers
- Define proper TypeScript interfaces for all data
- Implement business logic in services, not controllers
- Use `AppError` for consistent error handling
- Log operations with appropriate context
- Validate inputs with Zod schemas
- Follow RESTful API conventions
- Write meaningful commit messages

### Don'ts ❌

- Don't use `any` type unless absolutely necessary
- Don't put business logic in controllers or routes
- Don't catch errors unless you can handle them
- Don't forget to validate user inputs
- Don't expose sensitive data in API responses
- Don't hardcode configuration values
- Don't skip error logging

## 🔧 Development Tools

### Required

- **Node.js 18+**
- **pnpm** package manager
- **MongoDB** database
- **VS Code** (recommended editor)

### Recommended Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Thunder Client (API testing)
- MongoDB for VS Code

### Available Scripts

```bash
pnpm dev              # Development server with hot reload
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format with Prettier
pnpm type-check       # TypeScript type checking
```

## 🆘 Getting Help

### Documentation Resources

1. **This documentation** - Comprehensive guides for all patterns
2. **Code comments** - Inline documentation in the codebase
3. **Type definitions** - Check `src/shared/types/` for available interfaces
4. **Example implementations** - Study existing controllers and services

### Troubleshooting

- **Build errors**: Check `pnpm type-check` for TypeScript issues
- **Runtime errors**: Check logs and error stack traces
- **API issues**: Use Thunder Client or Postman to test endpoints
- **Database issues**: Verify MongoDB connection and data

### Community

- Ask team members for clarification on patterns
- Propose improvements to documentation
- Share knowledge about new patterns or best practices

## 📈 Contributing

### Documentation Updates

- Keep documentation up-to-date with code changes
- Add examples for complex patterns
- Improve clarity based on team feedback

### Code Contributions

- Follow existing patterns and conventions
- Add proper TypeScript types for new features
- Include appropriate error handling and logging
- Test thoroughly before committing

---

**Happy coding!** This documentation is designed to make you productive quickly
while maintaining code quality and consistency. When in doubt, follow the
patterns established in the existing codebase and don't hesitate to ask for
help.
