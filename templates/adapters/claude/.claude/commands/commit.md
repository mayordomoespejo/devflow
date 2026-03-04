# Devflow Commit

Propose a commit (or commits) for the current changes. Always propose before executing — never commit automatically.

If the user provided inline text, treat it as a hint about scope or message style.

---

## Step 1 — Detect changes

Run: `git status --porcelain`

If there are no changes: respond "No changes to commit." and stop.

## Step 2 — Scan for secrets

Run `git diff` and `git diff --staged`. Before proposing anything, scan the output for obvious secret patterns:

- `API_KEY=`, `SECRET=`, `TOKEN=`, `PASSWORD=`
- `BEGIN PRIVATE KEY`, `BEGIN RSA PRIVATE KEY`
- `Authorization: Bearer <long-string>`
- Random 32+ character strings in sensitive variable names

If a likely secret is found:
- **Stop. Do not continue with the commit proposal.**
- Warn the user: describe the exact file and line.
- Suggest: remove, rotate, use an env var, add the file to `.gitignore`.

## Step 3 — Analyze and propose

Read the full diff. Group logically related changes.

- **1 commit** if the changes form a single coherent unit.
- **2–4 commits** if there are clearly separable concerns (implementation / tests / docs / config).

Use Conventional Commits format:

```
<type>(<scope>): <subject>
```

Types: `feat` | `fix` | `refactor` | `test` | `docs` | `chore` | `perf` | `ci`
Subject: imperative mood, lowercase, no period, max 72 characters.

## Step 4 — Present the proposal

Show each commit clearly:

```
Commit 1
  Message: feat(auth): add OAuth2 token refresh
  Files:   src/auth/token.ts, src/auth/refresh.ts
  Command:
    git add src/auth/token.ts src/auth/refresh.ts
    git commit -m "feat(auth): add OAuth2 token refresh"
```

Do not execute any git commands yet.

## Step 5 — Ask for confirmation

Ask: **"Execute these git commands? (y/n)"**

- **y / yes / sí** → run the exact commands shown.
- **n / no** → do not execute. Leave the proposal available to copy.

## Always

- Never run `git push`.
- Never run `git commit --amend` or `git rebase` unless explicitly requested.
- Never use `--no-verify`.
- Never use `git add -A` or `git add .` unless the user explicitly requests it.
- Stage only the specific files listed in each commit's proposal.
- If a commit hook fails, report the error and stop.
