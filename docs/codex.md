# Devflow — Codex CLI

## What gets installed

```
AGENTS.md
.codex/
  README.md   ← project reference (not read by Codex CLI itself)
```

## Install

```sh
npx devflow init --tool codex
```

## How Codex reads instructions

Codex CLI reads `AGENTS.md` automatically at session start. Devflow installs it at the project root.

Codex loads `AGENTS.md` hierarchically (all are merged, later files take precedence):

1. `~/.codex/AGENTS.md` — global, applies to every session
2. `<project>/AGENTS.md` — project-level, installed by Devflow
3. Subdirectory `AGENTS.md` files, scoped to their directory

## What Codex does not support

| Feature | Cursor | Claude Code | Codex |
|---------|--------|-------------|-------|
| Slash commands | `.cursor/commands/` ✓ | `.claude/commands/` ✓ | — |
| Rules files | `.cursor/rules/` ✓ | via `CLAUDE.md` | — |
| Hooks | — | `.claude/settings.json` | — |

There are no Devflow slash commands for Codex. Instructions go entirely through `AGENTS.md`.

## Overriding instructions without editing AGENTS.md

Create `AGENTS.override.md` in the project root. Codex gives it precedence over `AGENTS.md`:

```md
# Project overrides

Prefer functional components over class components.
Always use Zod for validation at system boundaries.
Use pnpm instead of npm.
```

This lets you customise behaviour per project without touching the Devflow-managed `AGENTS.md`.

## Scoping instructions to a subdirectory

Place an `AGENTS.md` inside a subdirectory. Codex uses it when the working directory is that subtree:

```
my-app/
  AGENTS.md          ← loaded for all sessions in my-app/
  src/
    AGENTS.md        ← additional context when working inside src/
```

## Updating Devflow files

```sh
# Preview what would change
npx devflow init --tool codex --dry-run

# Overwrite with the latest templates
npx devflow init --tool codex --force
```

## Troubleshooting

**Codex ignores AGENTS.md**
- Confirm `AGENTS.md` is at the project root (not in a subdirectory).
- Run Codex from the project root, not from a parent directory.

**Instructions from a previous session are still applying**
- Codex reads `AGENTS.md` at the start of each session. Start a new session to pick up changes.

**Conflict on re-install**
- Use `--force` to overwrite: `npx devflow init --tool codex --force`
