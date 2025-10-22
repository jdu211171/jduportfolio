Copilot Commit Message Rules

Purpose

- Generate clear, consistent, and review‑ready commit messages that follow best practices and Conventional Commits.
- Do not include emojis, decorative characters, or branch names anywhere in the message.

Message Format

```
<type>[optional scope][!]: <short imperative summary>

<detailed body explaining what and why>

[optional footers]
```

Strict Rules

- No emojis or decorative symbols.
- Do not include the branch name anywhere.
- Use the imperative mood in the subject (e.g., "add", "fix", "update").
- Keep the subject concise: max 72 characters (50 preferred). No trailing period.
- Leave one blank line between subject and body.
- Wrap body lines at ~72 characters.
- Explain what changed and why, not just how.
- Use bullet points in the body when listing multiple changes.
- Reference issues/PRs in footers using standard keywords.

Allowed Types

- feat: a new feature
- fix: a bug fix
- perf: a performance improvement
- refactor: code change that neither fixes a bug nor adds a feature
- docs: documentation only changes
- style: formatting only; no code behavior change
- test: add or update tests
- build: changes to build system or dependencies
- ci: continuous integration/configuration changes
- chore: maintenance tasks that don’t affect src or tests
- revert: revert a previous commit

Scopes (optional)

- Use a concise scope in parentheses to indicate the affected area when helpful.
- Examples: client, server, api, auth, ui, styles, infra, deploy, ci, i18n.

Breaking Changes

- Indicate with an exclamation mark after the type/scope, and add a
  BREAKING CHANGE footer describing the impact and required actions.

Footers

- Closes #123, Fixes #456, Refs #789
- Co-authored-by: Name <email>
- BREAKING CHANGE: description

Good Examples

```
feat(client): add language persistence to navbar

- Persist selected language in localStorage
- Hydrate provider from stored value
- Add fallback to browser locale when missing

Refs: #321
```

```
fix(server)!: validate companyVideoUrl as JSON

- Replace string type with JSONB and add migration
- Update service/controller to parse and validate input
- Document API contract change

BREAKING CHANGE: companyProfile.companyVideoUrl is now a JSON object.
```

```
chore(ci): streamline deployment scripts for env parity

- Consolidate environment variable handling
- Remove redundant script branches
- Update README with usage instructions

Closes #152
```

Prohibited Content

- Branch names (do not include in subject or body).
- Emojis or decorative symbols.
- "WIP", vague phrases, or filler text.
- Stack traces, logs, or large diffs pasted into the message.

Authoring Checklist

- Subject uses "type(scope): summary" and imperative mood.
- Subject ≤ 72 chars, no trailing period.
- Body explains what changed and why; wrapped at ~72 chars.
- Includes references and footers when applicable.
- No branch name or emojis present.
