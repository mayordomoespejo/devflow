# Devflow — Claude Code

## What gets installed

```
AGENTS.md
.claude/
  commands/
    plan.md
    review.md
    tests.md
    verify.md
  rules/
    typescript.md
```

## Setup checklist

- [ ] `npx devflow init --tool claude` in the project root
- [ ] `AGENTS.md` exists at the project root
- [ ] `.claude/commands/` contains `plan.md`, `review.md`, `tests.md`, `verify.md`
- [ ] `.claude/rules/typescript.md` exists
- [ ] Open project with `claude` (Claude Code CLI) — commands are available immediately
- [ ] Commit: `git add AGENTS.md .claude && git commit -m "chore: add Devflow Claude Code workflow"`

---

## Install

```sh
npx devflow init --tool claude
```

Preview first, then apply:

```sh
npx devflow init --tool claude --dry-run
npx devflow init --tool claude --force   # overwrite existing
```

---

## How Claude Code reads instructions

Claude Code loads instruction files hierarchically (all merged, later entries take precedence):

1. `~/.claude/CLAUDE.md` — global, applies to all projects
2. `<project>/AGENTS.md` — universal workflow, installed by Devflow at the project root
3. `.claude/rules/typescript.md` — Always-on TypeScript rules, loaded from `.claude/rules/`

`AGENTS.md` is the primary instruction source installed by Devflow. Claude Code reads it automatically from the project root.

---

## Slash commands

Type any command in the Claude Code chat. Commands are picked up from `.claude/commands/` — no restart required after install.

| Command | What it does |
|---------|-------------|
| `/plan` | Step-by-step implementation plan before writing code |
| `/review` | Senior engineer code review of the current implementation |
| `/tests` | Generate test cases for the current implementation |
| `/verify` | Pre-finish checklist: edge cases, error handling, types |

**With an argument:**

```
/plan implement a paginated API endpoint
/tests for the UserRepository class
```

The text after the command name is passed as `$ARGUMENTS` to the command template.

---

## TypeScript rules

`.claude/rules/typescript.md` is applied as an Always-on rule. It enforces:

- Explicit types — no `any`, no implicit types
- Early returns over nested conditions
- Small, pure functions

Rules in `.claude/rules/` are loaded automatically by Claude Code for every conversation in the project.

---

## Adding project-specific instructions

To add your own instructions without modifying Devflow-managed files, create a `CLAUDE.md` at the project root:

```md
# Project instructions

Use pnpm instead of npm.
Prefer Zod for input validation at system boundaries.
```

Claude Code reads `CLAUDE.md` alongside `AGENTS.md`. Devflow does not install or manage `CLAUDE.md`, so you own it completely.

---

## Troubleshooting

**Commands don't appear in the chat panel**
- Confirm `.claude/commands/` exists at the project root (same level as `.git`).
- Commands are auto-discovered — no configuration required.
- Run `claude` from the project root, not a parent directory.

**TypeScript rule not applying**
- Confirm the file is at `.claude/rules/typescript.md`.
- Rules in `.claude/rules/` are loaded automatically for every project session.

**`/plan` produces no useful output**
- Pass a topic: `/plan implement user authentication`.
- If `$ARGUMENTS` is empty, the command still uses the current conversation context.

**AGENTS.md not being read**
- Confirm `AGENTS.md` is at the project root.
- Claude Code reads it from the working directory up to the git root.

**Conflict on re-install**
- `npx devflow init --tool claude --dry-run` — preview what changes
- `npx devflow init --tool claude --force` — overwrite Devflow-managed files
- `npx devflow init --tool claude --merge` — skip existing, add only new files
