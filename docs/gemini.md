# Devflow — Gemini CLI

## What gets installed

```
AGENTS.md
GEMINI.md
```

## Install

```sh
npx devflow init --tool gemini
```

## How Gemini reads instructions

Gemini CLI reads `GEMINI.md` files hierarchically and concatenates them all:

1. `~/.gemini/GEMINI.md` — global, applies to every session
2. `<project>/GEMINI.md` — project-level, installed by Devflow
3. Any `GEMINI.md` files found in subdirectories (scoped to their tree)

All files are sent to the model with every prompt. There is no precedence — they are merged.

`AGENTS.md` is also installed by Devflow for cross-tool consistency (other tools like Codex read it). Gemini CLI does not read `AGENTS.md` natively, so `GEMINI.md` contains the full workflow.

## What Gemini does not support

| Feature | Cursor | Claude Code | Gemini |
|---------|--------|-------------|--------|
| Slash commands | `.cursor/commands/` ✓ | `.claude/commands/` ✓ | — |
| Rules files | `.cursor/rules/` ✓ | via `CLAUDE.md` | — |
| Hooks | — | `.claude/settings.json` | — |

There are no Devflow slash commands for Gemini. Instructions go through `GEMINI.md`.

## Splitting instructions across subdirectories

Place a `GEMINI.md` in any subdirectory. Gemini loads it automatically when working in that tree:

```
my-app/
  GEMINI.md          ← global project instructions
  src/
    GEMINI.md        ← additional context for src/ work
  api/
    GEMINI.md        ← additional context for api/ work
```

## Importing files in GEMINI.md

Use `@` syntax to include other files inline — useful for large projects:

```md
@./docs/architecture.md
@./src/GEMINI.md
```

## Persistent memory

Use in-session commands to manage your global context:

```sh
/memory add Always prefer pnpm over npm in this project.
/memory refresh   # reload all GEMINI.md files mid-session
```

## Updating Devflow files

```sh
# Preview what would change
npx devflow init --tool gemini --dry-run

# Overwrite with the latest templates
npx devflow init --tool gemini --force
```

## Troubleshooting

**GEMINI.md not being picked up**
- Confirm `GEMINI.md` is at the project root.
- Run `gemini` from the project root, not a parent directory.
- Use `/memory refresh` inside a running session to reload without restarting.

**Instructions from AGENTS.md not applying**
- Gemini CLI does not read `AGENTS.md` natively. All instructions for Gemini should be in `GEMINI.md`.
- The Devflow-installed `GEMINI.md` already contains the full workflow from `AGENTS.md`.

**Conflict on re-install**
- Use `--force` to overwrite: `npx devflow init --tool gemini --force`
- Use `--merge` to skip existing files: `npx devflow init --tool gemini --merge`
