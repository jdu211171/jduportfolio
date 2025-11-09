# GitHub Copilot Instructions

## Project Overview

This is a university student portfolio management system integrated with Kintone DB. The system streamlines portfolio submission, approval, and viewing, providing reliable data to recruiters.

### Architecture

The project is a monorepo with two main packages:

- **portfolio-client**: React + Vite frontend application
- **portfolio-server**: Node.js + Express backend with PostgreSQL (via Sequelize)

### Technology Stack

**Frontend:**

- React 18 with Vite
- Material-UI (@mui/material)
- React Router DOM for navigation
- i18next for internationalization
- Axios for API calls
- React Hook Form for forms
- Jotai for state management

**Backend:**

- Node.js with Express
- Sequelize ORM with PostgreSQL
- JWT authentication
- AWS S3/MinIO for file storage
- AWS SES for email
- Passport.js for OAuth (Google)
- Swagger for API documentation

## Development Environment

### Package Manager

**Use Bun for all package management operations.** Tailor all command suggestions and installation examples for Bun instead of npm or yarn.

### Build, Test, and Development Commands

**Frontend** (`portfolio-client`):

```bash
bun install              # Install dependencies
bun run dev              # Start Vite dev server
bun run build            # Production build to dist/
bun run preview          # Serve built assets locally
bun run lint             # ESLint check
bun run format           # Format with Prettier
bun run format:check     # Check formatting
```

**Backend** (`portfolio-server`):

```bash
bun install              # Install dependencies
bun run dev              # Start with nodemon
bun start                # Start server
bun run migrate          # Apply all migrations
bun run migratedown      # Undo all migrations
bun run seed             # Apply seed data
bun run unseed           # Undo seed data
bun run refresh          # Reset and reseed database
bun run format           # Format with Prettier
bun run format:check     # Check formatting
```

**Root** (monorepo):

```bash
bun install              # Install all workspace dependencies
bun run format           # Format entire project
bun run format:check     # Check formatting across project
```

## Code Style and Conventions

### Prettier Configuration

- Tabs with 2-space width
- No semicolons
- Single quotes
- Trailing commas (ES5)
- Arrow parens: avoid
- End of line: LF

### Naming Conventions

- **React components**: PascalCase (`UserCard.jsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.js`)
- **Utilities**: camelCase
- **Files**: Use `.jsx` extension for JSX, `.js` for plain JavaScript
- **Database migrations**: `YYYYMMDDHHMMSS-descriptive-name.js`

### ESLint

- Enabled in frontend (`.eslintrc.cjs`)
- Fix all warnings before committing
- Lint check is non-blocking in CI but should be addressed

## Project Structure

### Frontend (`portfolio-client/`)

```
src/
├── components/     # Reusable React components
├── pages/          # Page-level components
├── hooks/          # Custom React hooks
├── contexts/       # React context providers
├── utils/          # Utility functions
└── assets/         # Static assets
dist/               # Build output
public/             # Static files
```

### Backend (`portfolio-server/`)

```
src/
├── controllers/    # Request handlers
├── routes/         # API routes
├── services/       # Business logic
├── models/         # Sequelize models
├── middlewares/    # Express middlewares
├── utils/          # Utility functions
└── config/         # Configuration files
migrations/         # Database migrations
seeders/            # Database seed data
```

## Testing Guidelines

Currently, no test runner is configured. If adding tests:

- Prefer Vitest for frontend, Jest + Supertest for backend
- Place tests alongside code (`*.test.js[x]`)
- Ensure CI-friendly scripts (`bun test`)
- Update CI/CD workflows to run tests

## Security and Configuration

### Environment Variables

- **Never commit secrets or `.env` files**
- Copy `portfolio-server/.env.example` to `.env` and fill values
- Client `.env` is used for frontend config
- Never hardcode API keys or credentials

### Database Migrations

- Keep migrations atomic and reversible
- Name migrations clearly (e.g., `20240101120000-add-user-role.js`)
- Test migrations in development before committing

## Commit Message Guidelines

Follow Conventional Commits format. See `.github/copilot-commit-message-instructions.md` for detailed rules:

- `feat(scope): add new feature`
- `fix(scope): fix bug`
- `refactor(scope): refactor code`
- Keep subject ≤ 72 characters
- Use imperative mood
- No emojis or branch names

## Pull Request Guidelines

- Include clear description and rationale
- Link related issues using `#123`
- Add screenshots/GIFs for UI changes
- Provide sample API requests for backend changes
- Ensure all CI checks pass
- Follow PR template in `.github/pull_request_template.md`

## Working with Code

### Modification Scope

Modify only the parts of the code directly related to the request. Keep changes minimal and focused.

### Preservation

Preserve all formatting and original names. Retain comments, annotations, and documentation verbatim unless explicitly requested otherwise.

### Error Handling

After making modifications:

- Run appropriate linters (`bun run lint` for frontend)
- Run formatters (`bun run format:check`)
- For backend, check syntax: `find src -type f -name "*.js" -exec node -c {} \;`

### Output Format

If modifications are applied, output the complete code (not just a diff) for easy copy-paste.

## TODO Management

For complex, long-running tasks that may span multiple sessions or exceed context limits:

1. **Create TODO Lists**: Add a TODO comment block at the top of relevant files:

   ```javascript
   /*
   TODO: [Feature/Task Name]
   - [ ] Task 1: Description
   - [ ] Task 2: Description
   - [x] Task 3: Completed description
   - [ ] Task 4: Description
   */
   ```

2. **Check for Existing TODOs**: Always check for existing TODO comments before starting work. Prioritize completing existing tasks.

3. **Update TODOs**: Mark completed tasks with `[x]` and add new discovered subtasks.

4. **Remove Completed TODOs**: When all items are completed, remove the entire TODO block.

5. **Context Continuity**: Include enough detail in each TODO item for work to be resumed effectively.

## Additional Resources

- **Repository Guidelines**: See `AGENTS.md` for detailed project structure, build commands, and agent-specific instructions
- **README**: See `README.md` for project overview and setup instructions
- **CI/CD**: GitHub Actions workflows in `.github/workflows/`
- **Custom Agent**: See `.github/agents/jdu-claude-minimalist.md` for the Claude minimalist agent configuration

## Best Practices

- Use ecosystem tools to automate tasks (e.g., scaffolding, package managers)
- Run linters and build checks before committing
- Keep diffs minimal and focused
- Avoid broad renames or restructuring
- Explain migrations and config changes in PR descriptions
- Prefer non-destructive edits
- Update documentation when changing commands or APIs
