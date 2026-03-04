# Devflow — Codex Instructions

This project uses Devflow to standardise AI-assisted development workflows.
Codex CLI reads `AGENTS.md` at the project root automatically at session start.

## How Codex reads instructions

Codex loads instruction files hierarchically (all merged, later entries take precedence):

1. `~/.codex/AGENTS.md` — global, applied to every session
2. Project root `AGENTS.md` — installed by Devflow
3. Subdirectory `AGENTS.md` files, scoped to their directory

## What Codex does not support

Codex is an instruction-based target — no command system, no rules files, no hooks.

| Feature | Cursor | Claude Code | Codex | Gemini |
|---------|--------|-------------|-------|--------|
| Slash commands | `.cursor/commands/` | `.claude/commands/` | — | — |
| Rules / style files | `.cursor/rules/` | `.claude/rules/` | — | — |
| Hooks | — | `.claude/settings.json` | — | — |

All instructions must go in `AGENTS.md`.

## Overriding instructions

Create `AGENTS.override.md` at the project root. Codex gives it precedence over `AGENTS.md`:

```md
# My project overrides

Prefer functional components over class components.
Always use Zod for input validation.
Use pnpm instead of npm.
```

This lets you customise behaviour per project without touching the Devflow-managed file.
