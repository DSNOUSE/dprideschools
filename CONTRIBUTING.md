# Contributing to DPRIDE International School Website

Thank you for your interest in contributing to the DPRIDE International School website! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on what is best for the community and the students we serve
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discriminatory language, or personal attacks
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information without permission

## Getting Started

### Prerequisites

- Node.js 18+ (tested with Node 20)
- PostgreSQL database
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/dprideinternationalschool.git
   cd dprideinternationalschool
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/DSNOUSE/dprideinternationalschool.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp env.example .env
   # Fill in your local values
   ```

6. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run db:seed
   ```

7. **Run the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Branches

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Workflow Steps

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow the coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   npm run test
   npm run type-check
   npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting, etc.)
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to GitHub and create a PR from your fork
   - Fill in the PR template
   - Link any related issues

## Coding Standards

### TypeScript

```typescript
// ✅ Good
interface Student {
  id: string;
  name: string;
  email: string;
}

function getStudent(id: string): Promise<Student> {
  return prisma.student.findUnique({ where: { id } });
}

// ❌ Bad
function getStudent(id: any): any {
  return prisma.student.findUnique({ where: { id } });
}
```

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn-${variant}`}
    >
      {label}
    </button>
  );
}

// ❌ Bad
export function Button({ label, onClick, variant }: any) {
  return <button onClick={onClick}>{label}</button>;
}
```

### API Routes

```typescript
// ✅ Good
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ApiErrors, createErrorResponse } from '@/lib/api-error';
import { hasRole } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasRole(session, 'Administrator')) {
      throw ApiErrors.Forbidden();
    }

    // Your logic here
    return NextResponse.json({ data: [] });
  } catch (error) {
    const errorResponse = createErrorResponse(error);
    return NextResponse.json(errorResponse, { 
      status: error instanceof ApiError ? error.statusCode : 500 
    });
  }
}
```

### Best Practices

1. **Use the utilities**
   - Use `@/lib/logger` instead of `console.log`
   - Use `@/lib/auth-utils` for role checking
   - Use `@/lib/api-error` for error handling

2. **Type safety**
   - Always define interfaces for props and data
   - Avoid `any` type
   - Use TypeScript strict mode

3. **Error handling**
   - Always use try-catch in async functions
   - Log errors appropriately
   - Return user-friendly error messages

4. **Performance**
   - Use Next.js Image component for images
   - Implement proper caching strategies
   - Optimize database queries

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something', () => {
    const result = yourFunction();
    expect(result).toBe(expected);
  });
});
```

### Test Coverage

- Aim for at least 70% code coverage
- All new features must include tests
- Bug fixes should include regression tests

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] All tests pass
- [ ] New code has tests
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] TypeScript types are properly defined
- [ ] Commits follow conventional commit format

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console.logs
```

### Review Process

1. At least one approval required
2. All CI checks must pass
3. No merge conflicts
4. Up to date with base branch

## Project Structure

```
dprideschools/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin area
│   └── ...                # Public pages
├── src/
│   ├── components/        # React components
│   ├── lib/              # Utilities and configs
│   └── app/              # App-specific code
├── prisma/               # Database schema and migrations
├── tests/                # Test files
└── public/               # Static assets
```

### Key Files

- `src/lib/auth.ts` - Authentication configuration
- `src/lib/auth-utils.ts` - Auth helper functions
- `src/lib/api-error.ts` - Error handling
- `src/lib/logger.ts` - Logging utility
- `src/lib/env.ts` - Environment validation
- `prisma/schema.prisma` - Database schema

## Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Ask in discussions
4. Email: dev@dprideschools.com

Thank you for contributing! 🎉
