# Commitlint Configuration

This project uses [commitlint](https://commitlint.js.org/) with the [conventional commits](https://www.conventionalcommits.org/) specification to ensure consistent and meaningful commit messages.

## Commit Message Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes
- **revert**: Revert a previous commit

### Examples

```bash
# Valid commit messages
git commit -m "feat: add user authentication middleware"
git commit -m "fix(auth): resolve JWT token validation issue"
git commit -m "docs: update API documentation"
git commit -m "style: format code with prettier"
git commit -m "refactor(db): optimize database queries"
git commit -m "test: add unit tests for user service"
git commit -m "chore: update dependencies"

# Invalid commit messages (will be rejected)
git commit -m "update stuff"
git commit -m "Fix bug"
git commit -m "WIP: working on feature"
```

## Rules

- **Subject length**: 3-72 characters
- **Header length**: Maximum 100 characters
- **Subject case**: No Pascal case or UPPER CASE
- **Subject ending**: No period at the end
- **Body**: Must have blank line before body if present
- **Footer**: Must have blank line before footer if present

## Testing Commitlint

To test commitlint manually on your last commit:

```bash
npx commitlint --from HEAD~1 --to HEAD --verbose
```

## Git Hooks

This project uses Husky to automatically validate commit messages:

- **Pre-commit**: Runs lint-staged to check code quality
- **Commit-msg**: Validates commit message format with commitlint

If your commit message doesn't follow the conventional format, the commit will be rejected and you'll see an error message explaining what's wrong.
