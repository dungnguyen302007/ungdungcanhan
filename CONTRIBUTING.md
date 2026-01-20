# 🤝 Contributing Guidelines

Thank you for considering contributing to this Personal Finance Management app! This document provides guidelines and best practices for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in this project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive Behavior:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable Behavior:**
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ungdungcanhan.git
   cd ungdungcanhan
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/dungnguyen302007/ungdungcanhan.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Create `.env` file**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

6. **Start dev server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `style/` - Code style changes (formatting)
- `test/` - Adding/updating tests
- `chore/` - Build process, dependencies

### 3. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 4. Test Your Changes

```bash
# Run dev server
npm run dev

# Run linter
npm run lint

# Run tests (when available)
npm test
```

### 5. Commit Changes

```bash
git add .
git commit -m "type: brief description"
```

See [Commit Guidelines](#commit-guidelines) below.

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Go to GitHub and create a Pull Request from your branch to `main`.

---

## Coding Standards

### TypeScript

✅ **DO:**
```typescript
// Use explicit types
interface Transaction {
  id: string;
  amount: number;
}

// Use type inference when obvious
const total = transactions.reduce((sum, t) => sum + t.amount, 0);

// Use async/await
async function fetchData() {
  const response = await fetch(url);
  return response.json();
}
```

❌ **DON'T:**
```typescript
// Avoid `any` type
const data: any = getData();

// Avoid implicit any
function process(input) { ... }

// Avoid promise chains when async/await is clearer
fetch(url).then(r => r.json()).then(data => ...);
```

### React Components

✅ **DO:**
```typescript
// Use functional components
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // ...
};

// Use named exports
export const MyComponent = () => { ... };

// Destructure props
const { name, age } = props;
```

❌ **DON'T:**
```typescript
// Avoid class components (unless needed)
class MyComponent extends React.Component { ... }

// Avoid default exports (inconsistent)
export default MyComponent;

// Avoid anonymous components
export default () => { ... };
```

### Styling

✅ **DO:**
```typescript
// Use Tailwind utility classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-white">

// Use clsx for conditional classes
<div className={clsx(
  'base-class',
  isActive && 'active-class',
  error && 'error-class'
)}>
```

❌ **DON'T:**
```typescript
// Avoid inline styles (unless absolutely necessary)
<div style={{ padding: '16px', margin: '8px' }}>

// Avoid hardcoded colors (use Tailwind)
<div style={{ backgroundColor: '#FF0000' }}>
```

### File Organization

```
Component files should include:
1. Import statements (grouped)
2. Type definitions
3. Component definition
4. Exports

Example:
// 1. Imports
import React, { useState } from 'react';
import { Button } from './Button';

// 2. Types
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  return <div>{title}</div>;
};
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, missing semi-colons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies
- `perf`: Performance improvements

### Examples

```bash
# Feature
git commit -m "feat: add budget setting feature"
git commit -m "feat(analytics): add expense trend chart"

# Bug fix
git commit -m "fix: correct currency formatting for large numbers"
git commit -m "fix(auth): resolve Google login redirect issue"

# Documentation
git commit -m "docs: update installation guide in README"

# Refactor
git commit -m "refactor: extract custom hooks from App.tsx"

# Style
git commit -m "style: format code with prettier"

# Chore
git commit -m "chore: update dependencies to latest versions"
```

---

## Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated (if needed)
- [ ] No new warnings/errors
- [ ] Tests pass (if applicable)
- [ ] Commits follow conventional commits

### PR Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Screenshots (if applicable)
[Add screenshots]

## Testing
How to test these changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks** (when CI is set up)
   - ESLint passes
   - Tests pass
   - Build succeeds

2. **Code Review**
   - Maintainer reviews code
   - Feedback provided
   - Changes requested (if needed)

3. **Approval**
   - Once approved, PR is merged
   - Squash and merge preferred

---

## Testing Guidelines

### Unit Tests (Future)

```typescript
// Example test for format.ts
describe('formatCurrency', () => {
  it('should format VND currency correctly', () => {
    expect(formatCurrency(1000000)).toBe('1.000.000 ₫');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('0 ₫');
  });
});
```

### Component Tests (Future)

```typescript
// Example test for TransactionForm
describe('TransactionForm', () => {
  it('should validate amount input', () => {
    // Test implementation
  });

  it('should submit form with valid data', () => {
    // Test implementation
  });
});
```

---

## Questions?

If you have questions, feel free to:
- Open an issue on GitHub
- Reach out to the maintainer

---

**Thank you for contributing! 🎉**
