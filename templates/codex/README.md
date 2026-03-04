# Devflow — Codex CLI Reference

This file is installed by Devflow into `.codex/` to document how Codex CLI is
configured in this project.

## How Codex reads instructions

Codex CLI reads `AGENTS.md` automatically at session start.
Devflow installs `AGENTS.md` at the project root with engineering workflow and principles.

Codex reads `AGENTS.md` hierarchically:

1. `~/.codex/AGENTS.md` — global, applied to all sessions
2. Project root `AGENTS.md` — installed by Devflow
3. Subdirectory `AGENTS.md` files, scoped to their directory

## What Codex does not support

| Feature | Cursor | Claude Code | Gemini | Codex |
|---------|--------|-------------|--------|-------|
| Slash commands | `.cursor/commands/` | `.claude/commands/` | — | — |
| Rules / style files | `.cursor/rules/` | via CLAUDE.md | via GEMINI.md | — |
| Hooks | — | `.claude/settings.json` | — | — |

There are no Codex-specific command or rules files. Instructions go entirely in `AGENTS.md`.

## Overriding instructions

Create `AGENTS.override.md` in the project root to override specific instructions
from `AGENTS.md` without modifying the Devflow-installed file:

```md
# My project overrides

Prefer functional components over class components.
Always use Zod for input validation.
```

Codex gives `AGENTS.override.md` precedence over `AGENTS.md`.
