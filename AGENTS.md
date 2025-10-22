# Repository Guidelines

## Project Structure & Module Organization

- `portfolio-client/`: React + Vite app. Source in `src/` (components, pages, hooks, contexts, utils, assets). Build output in `dist/`; static files in `public/`.
- `portfolio-server/`: Node/Express + Sequelize. Source in `src/` (controllers, routes, services, models, middlewares, utils, config). DB artifacts in `migrations/` and `seeders/`. PM2 config in `ecosystem.config.js`.
- Shared config: Prettier at repo root (`.prettierrc`). Additional docs: `README.md`, `nginx.conf`, deployment scripts `deploy.sh` in each package.

## Build, Test, and Development Commands

Frontend (`portfolio-client`):

- `npm i` then `npm run dev` — start Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve built assets locally.
- `npm run lint` — ESLint check. `npm run format[:check]` — Prettier write/check.

Backend (`portfolio-server`):

- `npm i` then `npm run dev` — start with nodemon. `npm start` — start server.
- `npm run migrate` / `migratedown` — apply/undo all migrations.
- `npm run seed` / `unseed` — apply/undo seed data. `npm run refresh` — reset + reseed.
- `npm run format[:check]` — Prettier write/check.

## Coding Style & Naming Conventions

- Prettier (root `.prettierrc`): tabs, 2-space width, no semicolons, single quotes, `trailingComma: es5`, `arrowParens: avoid`, `endOfLine: lf`.
- Client: React components PascalCase (`UserCard.jsx`), hooks `useThing.js`, utilities camelCase. Keep JSX in `.jsx`.
- Lint: ESLint enabled in client (`.eslintrc.cjs`). Fix warnings before committing.

## Testing Guidelines

- No test runner is configured yet. If adding tests, prefer Vitest/Jest for client and Jest + Supertest for server. Place tests alongside code (`*.test.js[x]`). Ensure CI-friendly scripts (`npm test`) if you introduce tests.

## Commit & Pull Request Guidelines

- Use Conventional Commits: `feat(scope): summary`, `fix(scope): summary`, `refactor(scope): …`. Keep subject ≤ 72 chars.
- PRs: include clear description, rationale, and steps to verify. Link issues (`#123`). Add screenshots/GIFs for UI changes and sample API requests for backend changes.

## Security & Configuration Tips

- Do not commit secrets. Copy `portfolio-server/.env.example` to `.env` and fill values. Client `.env` is used for frontend config; never hardcode keys.
- Database: keep migrations atomic and reversible; name clearly (e.g., `YYYYMMDDHHMMSS-add-news-views.js`).

## Agent-Specific Instructions

- Keep diffs minimal and focused; avoid broad renames.
- Follow structure above, run Prettier, and update docs when changing commands or APIs.
- Prefer non-destructive edits; explain migrations and config changes in PR body.
