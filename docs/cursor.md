# Devflow — Cursor

## What gets installed

```
AGENTS.md
.cursor/
  commands/
    plan.md
    review.md
    tests.md
    verify.md
  rules/
    typescript.md
```

## Install

```sh
npx devflow init --tool cursor
```

## Using the commands

Open any file in Cursor and type a slash command in the chat:

| Command | What it does |
|---------|-------------|
| `/plan` | Generates a step-by-step implementation plan before writing code |
| `/review` | Reviews the current implementation as a senior engineer |
| `/tests` | Generates test cases for the current implementation |
| `/verify` | Checks correctness, edge cases, and simplicity before finishing |

> Commands are stored in `.cursor/commands/`. Cursor picks them up automatically — no restart required.

## TypeScript rules

`typescript.md` is a Cursor rule that applies to all TypeScript files. It enforces:

- Explicit types (no `any`, no implicit types)
- Early returns over nested conditions
- Small pure functions

Rules live in `.cursor/rules/`. Cursor applies them as Always-on rules by default (plain `.md` format). To use activation modes (Auto Attach by glob, Agent Requested, Manual), convert the file to `.mdc` format and add YAML front matter — see [Cursor rules docs](https://cursor.com/docs/context/rules).

## AGENTS.md

`AGENTS.md` is a universal instruction file. Cursor does not read it directly, but other tools installed alongside (Claude Code, Codex) will use it. Keep it in your repo for cross-tool consistency.

## Updating Devflow files

```sh
# Preview what would change
npx devflow init --tool cursor --dry-run

# Overwrite with the latest templates
npx devflow init --tool cursor --force
```

## Troubleshooting

**Commands don't appear in Cursor**
- Confirm `.cursor/commands/` exists in your project root.
- Cursor auto-discovers command files — if they're there, they should appear.
- Restart Cursor if they still don't show up.

**TypeScript rule not applying**
- Check the file is at `.cursor/rules/typescript.md`.
- Rules in `.md` format apply as Always-on globally. If you want glob-scoped rules, rename to `.mdc` and add front matter.

**Conflict on re-install**
- Use `--force` to overwrite: `npx devflow init --tool cursor --force`
- Use `--dry-run` first to see what would change.
