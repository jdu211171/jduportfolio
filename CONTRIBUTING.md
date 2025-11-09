# Contributing to JDU Portfolio

Thank you for your interest in contributing to the JDU Portfolio project! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Testing](#testing)

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/jduportfolio.git
   cd jduportfolio
   ```
3. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/jdu211171/jduportfolio.git
   ```

## Development Setup

This project uses **Bun** as the package manager. Make sure you have Bun installed.

### Prerequisites

- Node.js (v18 or higher)
- Bun
- PostgreSQL (for backend development)
- Git

### Installation

1. Install dependencies:

   ```bash
   bun install
   ```

2. Set up the backend:

   ```bash
   cd portfolio-server
   cp .env.example .env
   # Edit .env with your configuration
   bun run migrate
   bun run seed
   ```

3. Set up the frontend:
   ```bash
   cd portfolio-client
   # Create .env if needed for environment-specific configuration
   ```

### Running the Project

**Frontend:**

```bash
cd portfolio-client
bun run dev
```

**Backend:**

```bash
cd portfolio-server
bun run dev
```

## Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the [code style guidelines](#code-style)

3. Test your changes thoroughly

4. Format your code:
   ```bash
   bun run format
   ```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification. See `.github/copilot-commit-message-instructions.md` for detailed rules.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Formatting changes (no code behavior change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system or dependency changes
- `ci`: CI/CD configuration changes
- `chore`: Maintenance tasks

### Examples

```
feat(client): add language persistence to navbar

- Persist selected language in localStorage
- Hydrate provider from stored value
- Add fallback to browser locale when missing
```

```
fix(server): validate companyVideoUrl as JSON

- Replace string type with JSONB and add migration
- Update service/controller to parse and validate input
```

### Rules

- Use imperative mood ("add" not "added")
- Keep subject line ≤ 72 characters
- No emojis or branch names in commit messages
- Reference issues with `Closes #123` or `Refs #456` in footer

## Pull Request Process

1. Update your branch with the latest changes from `main`:

   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch-name
   git rebase main
   ```

2. Push your changes to your fork:

   ```bash
   git push origin your-branch-name
   ```

3. Create a Pull Request on GitHub

4. Fill out the PR template with:
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - API examples for backend changes

5. Ensure all CI checks pass

6. Address any review feedback

### PR Requirements

- All CI checks must pass
- Code must be formatted with Prettier
- Follow the project's code style
- Include appropriate tests (when applicable)
- Update documentation if needed

## Code Style

### General

- Follow the existing code style in the project
- Use Prettier for formatting (configured in `.prettierrc`)
- Run `bun run format:check` before committing

### JavaScript/React

- Use functional components and hooks
- Keep components small and focused
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Use `.jsx` extension for files with JSX

### Naming Conventions

- **Components**: PascalCase (`UserCard.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`)
- **Utilities**: camelCase (`formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Backend

- Use async/await for asynchronous operations
- Implement proper error handling
- Keep controllers thin, services thick
- Write atomic and reversible database migrations

## Testing

Currently, the project does not have a comprehensive test suite. If you're adding tests:

- Use Vitest for frontend tests
- Use Jest + Supertest for backend tests
- Place tests alongside the code they test
- Name test files with `.test.js` or `.test.jsx` extension

## Database Migrations

When creating migrations:

1. Use descriptive names:

   ```bash
   npx sequelize-cli migration:generate --name add-user-role
   ```

2. Make migrations reversible (implement both `up` and `down`)
3. Test migrations before committing:
   ```bash
   bun run migrate
   bun run migratedown
   bun run migrate
   ```

## Questions or Problems?

- Check existing issues on GitHub
- Read the [README.md](README.md) and [AGENTS.md](AGENTS.md)
- Review `.github/copilot-instructions.md` for development guidelines
- Open a new issue if you need help

## License

By contributing, you agree that your contributions will be licensed under the GNU General Public License v3.0.

## Additional Resources

- [Copilot Instructions](.github/copilot-instructions.md)
- [Commit Message Guidelines](.github/copilot-commit-message-instructions.md)
- [Agent Guidelines](AGENTS.md)
- [README](README.md)
