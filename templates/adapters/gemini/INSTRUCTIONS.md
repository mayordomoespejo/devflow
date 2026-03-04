# Devflow — Gemini Instructions

This project uses Devflow to standardise AI-assisted development workflows.

## How Gemini reads instructions

Gemini CLI reads `GEMINI.md` files hierarchically and concatenates them all:

1. `~/.gemini/GEMINI.md` — global, applied to every session
2. Project root `GEMINI.md` — your project instructions
3. Subdirectory `GEMINI.md` files, scoped to their directory

Create a `GEMINI.md` at the project root with your instructions.
The `AGENTS.md` installed by Devflow contains the universal workflow — you can
import it directly:

```md
@./AGENTS.md
```

## What Gemini does not support

Gemini is an instruction-based target — no command system, no rules files, no hooks.

| Feature | Cursor | Claude Code | Gemini | Codex |
|---------|--------|-------------|--------|-------|
| Slash commands | `.cursor/commands/` | `.claude/commands/` | — | — |
| Rules / style files | `.cursor/rules/` | `.claude/rules/` | — | — |
| Hooks | — | `.claude/settings.json` | — | — |

All instructions must go in `GEMINI.md`.

## Splitting instructions across subdirectories

Place a `GEMINI.md` in any subdirectory. Gemini loads it automatically:

```
my-app/
  GEMINI.md        ← global project instructions
  src/
    GEMINI.md      ← additional context for src/ work
```

## Memory and persistence

```sh
/memory add Always prefer pnpm over npm in this project.
/memory refresh   # reload all GEMINI.md files mid-session
```
