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

## Setup checklist

- [ ] `npx devflow init --adapter cursor` in the project root
- [ ] `DEVFLOW.md` exists at the project root
- [ ] `devflow/prompts/` exists at the project root
- [ ] `AGENTS.md` exists at the project root
- [ ] `.cursor/commands/` contains `plan.md`, `review.md`, `tests.md`, `verify.md`
- [ ] `.cursor/rules/typescript.md` exists
- [ ] Open project in Cursor — commands are available immediately, no restart needed
- [ ] Commit: `git add AGENTS.md .cursor && git commit -m "chore: add Devflow Cursor workflow"`

---

## Install

```sh
npx devflow init --adapter cursor
```

Preview first, then apply:

```sh
npx devflow init --adapter cursor --dry-run
npx devflow init --adapter cursor --force   # overwrite existing
```

---

## Slash commands

Type any command in the Cursor chat panel. No restart required after install.

| Command | What it does |
|---------|-------------|
| `/plan` | Step-by-step implementation plan before writing code |
| `/review` | Senior engineer code review of the current implementation |
| `/tests` | Generate test cases for the current implementation |
| `/verify` | Pre-finish checklist: edge cases, error handling, types |

**With an argument:**

```
/plan add a rate limiter to the API
/tests for the AuthService class
```

The text after the command name is passed as context to the template.

Commands live in `.cursor/commands/`. Cursor auto-discovers any `.md` file placed there — add your own by dropping additional files into that directory.

---

## TypeScript rules

`.cursor/rules/typescript.md` is applied as an Always-on rule across all conversations. It enforces:

- Explicit types — no `any`, no implicit types
- Early returns over nested conditions
- Small, pure functions

**Scope:** Always-on (global by default). To scope a rule to specific files, rename it to `.mdc` and add a `globs` field in YAML front matter — see the [Cursor rules docs](https://docs.cursor.com/context/rules).

---

## AGENTS.md

`AGENTS.md` sits at the project root and contains the universal engineering principles shared across all tools. Cursor does not read it natively, but keeping it in the repo ensures teammates using Claude Code or Codex get the same baseline instructions.

---

## Troubleshooting

**Commands don't appear in the chat panel**
- Confirm `.cursor/commands/` is at the project root (same level as `.git`).
- Cursor auto-discovers command files — no configuration required.
- Restart Cursor if they still don't appear after confirming the files exist.

**TypeScript rule not applying**
- Confirm the file path is `.cursor/rules/typescript.md` (not `.mdc`).
- `.md` rules are Always-on globally. For Auto Attach by glob or Agent Requested mode, rename to `.mdc` with the appropriate front matter.

**Conflict on re-install**
- `npx devflow init --adapter cursor --dry-run` — preview what changes
- `npx devflow init --adapter cursor --force` — overwrite Devflow-managed files
- `npx devflow init --adapter cursor --merge` — skip existing, add only new files
