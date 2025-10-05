# Configuration Roadmap for New Joiners 🛠️

Welcome to the Chat App Backend! This roadmap will guide you through
understanding and configuring all the necessary files to get the project running
smoothly. Follow this step-by-step guide to ensure proper setup.

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] **Node.js 18+** installed
- [ ] **pnpm** package manager installed
- [ ] **MongoDB** (local installation or cloud access)
- [ ] **Git** configured
- [ ] **VS Code** with TypeScript extension (recommended)
- [ ] Basic understanding of TypeScript and Node.js

## 🗂️ Configuration Files Overview

This project uses multiple configuration files that work together:

| File                   | Purpose                        | Priority   | Required Changes     |
| ---------------------- | ------------------------------ | ---------- | -------------------- |
| `.env`                 | Environment variables          | **HIGH**   | Create from template |
| `package.json`         | Project dependencies & scripts | **MEDIUM** | Review only          |
| `tsconfig.json`        | TypeScript compilation         | **LOW**    | No changes needed    |
| `eslint.config.js`     | Code linting rules             | **LOW**    | No changes needed    |
| `commitlint.config.js` | Commit message rules           | **LOW**    | No changes needed    |
| `pnpm-workspace.yaml`  | PNPM workspace config          | **LOW**    | No changes needed    |

## 🚀 Step-by-Step Configuration Guide

### Step 1: Initial Project Setup

```bash
# 1. Clone the repository (if not done already)
git clone <repository-url>
cd chat-app/backend

# 2. Install dependencies
pnpm install

# 3. Verify installation
pnpm --version
node --version
```

### Step 2: Environment Configuration (CRITICAL)

This is the most important step - the app won't run without proper environment
setup.

#### 2.1 Create Environment File

```bash
# Copy the example environment file
cp .env.example .env
```

#### 2.2 Configure Environment Variables

Edit the `.env` file with your settings:

```env
# Application Environment
NODE_ENV=development
PORT=3000
HOST=localhost

# Database Configuration
# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/chat-app

# Option 2: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT Configuration (IMPORTANT: Generate secure keys for production!)
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secure-jwt-refresh-secret-at-least-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration (Update for your frontend URL)
CORS_ORIGIN=http://localhost:5173
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security Settings
BCRYPT_ROUNDS=12

# Cookie Configuration
COOKIE_SECRET=your-32-character-cookie-secret-key
COOKIE_SECURE=false            # Set to true in production with HTTPS
COOKIE_HTTP_ONLY=true
COOKIE_SAME_SITE=lax           # Options: strict, lax, none
COOKIE_ACCESS_TOKEN_EXPIRES=900000     # 15 minutes in milliseconds
COOKIE_REFRESH_TOKEN_EXPIRES=604800000 # 7 days in milliseconds

# Email Configuration (Optional for development)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### Step 3: Database Setup

#### 3.1 Local MongoDB Setup

```bash
# Install MongoDB locally (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

#### 3.2 MongoDB Atlas Setup (Alternative)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address
5. Get the connection string and update `MONGODB_URI` in `.env`

### Step 4: Security Configuration

#### 4.1 Generate Secure Secrets

For production or secure development, generate proper secrets:

```bash
# Generate JWT secrets (run in terminal)
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated values to your `.env` file.

### Step 5: Development Tools Configuration

#### 5.1 Understanding package.json Scripts

Key scripts you'll use:

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Linting and formatting
pnpm lint
pnpm lint:fix
pnpm format

# Type checking
pnpm type-check
```

#### 5.2 Git Hooks Setup (Automatic)

The project uses Husky for Git hooks. After `pnpm install`, these are
automatically configured:

- **Pre-commit**: Runs linting and formatting on staged files
- **Commit-msg**: Validates commit message format

### Step 6: Testing Your Configuration

#### 6.1 Basic Startup Test

```bash
# Start the development server
pnpm dev

# You should see output like:
# Server running on http://localhost:3000
# Connected to MongoDB
```

#### 6.2 Configuration Verification

Check if all configurations are loaded correctly:

```bash
# The server should start without errors
# Check logs/app.log for any warnings
tail -f logs/app.log
```

#### 6.3 Database Connection Test

```bash
# Test MongoDB connection
mongosh chat-app --eval "db.stats()"
```

## 🔧 Configuration Files Deep Dive

### TypeScript Configuration (`tsconfig.json`)

Pre-configured with strict settings for optimal development:

- **Strict mode enabled**: Catches common errors
- **ES2022 target**: Modern JavaScript features
- **Source maps**: For debugging
- **Path mapping**: Absolute imports with `@/` alias

> **Note:** Rarely needs modification

### ESLint Configuration (`eslint.config.js`)

Configured with:

- TypeScript support
- Prettier integration
- Strict linting rules
- Custom rules for this project

> **Note:** Avoid modifying unless you understand the impact

### Commit Configuration (`commitlint.config.js`)

Enforces conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/maintenance tasks

**Example valid commits:**

```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update API documentation"
```

### PNPM Workspace (`pnpm-workspace.yaml`)

Minimal configuration for:

- Native dependencies (bcrypt) compilation
- Monorepo support (if expanded later)

> **Note:** No changes needed

## 🌍 Environment-Specific Configurations

### Development Environment

```env
NODE_ENV=development
LOG_LEVEL=debug
COOKIE_SECURE=false
# Use loose CORS for development
CORS_ORIGIN=*
```

### Production Environment

```env
NODE_ENV=production
LOG_LEVEL=error
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
# Strict CORS for production
CORS_ORIGIN=https://yourdomain.com
```

### Testing Environment

```env
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/chat-app-test
LOG_LEVEL=silent
```

## 🚨 Common Configuration Issues & Solutions

### Issue 1: Server Won't Start

**Symptoms:** Server crashes on startup **Solution:**

```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check if port is available
lsof -i :3000

# Verify environment file exists
ls -la .env
```

### Issue 2: Database Connection Fails

**Symptoms:** "MongoDB connection error" **Solution:**

1. Verify MongoDB is running
2. Check `MONGODB_URI` in `.env`
3. Ensure database user has correct permissions (Atlas)
4. Check firewall/network settings

### Issue 3: Authentication Not Working

**Symptoms:** JWT errors, login failures **Solution:**

1. Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
2. Ensure secrets are at least 32 characters long
3. Check `COOKIE_SECRET` is configured
4. Verify CORS settings for your frontend

### Issue 4: CORS Errors

**Symptoms:** Frontend can't connect to backend **Solution:**

1. Update `CORS_ORIGIN` to match your frontend URL
2. Set `CORS_CREDENTIALS=true` if using cookies
3. For development, you can temporarily use `CORS_ORIGIN=*`

### Issue 5: Linting/Formatting Errors

**Symptoms:** Git commits fail, linting errors **Solution:**

```bash
# Fix linting issues
pnpm lint:fix

# Fix formatting issues
pnpm format

# Run type check
pnpm type-check
```

## 📚 Additional Resources

### Configuration References

- [ENV_CONFIG.md](./ENV_CONFIG.md) - Detailed environment variable guide
- [COOKIE_CONFIG.md](./COOKIE_CONFIG.md) - Cookie security settings
- [docs/ENV_QUICK_REFERENCE.md](./docs/ENV_QUICK_REFERENCE.md) - Code usage
  examples

### Development Guides

- [docs/QUICK_START.md](./docs/QUICK_START.md) - Quick project setup
- [docs/DEVELOPER.md](./docs/DEVELOPER.md) - Development guidelines
- [docs/TYPE_SYSTEM.md](./docs/TYPE_SYSTEM.md) - TypeScript patterns

### Architecture Documentation

- [docs/CONTROLLERS.md](./docs/CONTROLLERS.md) - Controller patterns
- [docs/SERVICES.md](./docs/SERVICES.md) - Service layer guide
- [docs/MIDDLEWARE.md](./docs/MIDDLEWARE.md) - Middleware documentation

## ✅ Configuration Checklist

Before you start developing, ensure:

- [ ] `.env` file created and configured
- [ ] MongoDB is running and accessible
- [ ] All secrets are generated and secure
- [ ] Server starts successfully with `pnpm dev`
- [ ] Database connection is established
- [ ] Linting and formatting tools work
- [ ] Git hooks are functioning
- [ ] You understand the project structure
- [ ] You've read the relevant documentation

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs** in `logs/app.log`
2. **Review this roadmap** for common solutions
3. **Consult the documentation** in the `docs/` folder
4. **Ask the team** - we're here to help!

---

**Next Steps:** Once your configuration is complete, check out
[docs/QUICK_START.md](./docs/QUICK_START.md) to start developing!
