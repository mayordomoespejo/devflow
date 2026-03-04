# Devflow for Codex CLI

Codex CLI uses `AGENTS.md` as its primary instruction file, read automatically at session start.

When you run `devflow init --tool codex` (or `--tool all`), Devflow installs:

- `AGENTS.md` — from `common/`, the universal workflow and engineering principles

## What Codex does not support

| Feature | Cursor | Claude Code | Codex |
|---------|--------|-------------|-------|
| Slash commands | `.cursor/commands/` | `.claude/commands/` | — |
| Rules system | `.cursor/rules/` | via CLAUDE.md | — |
| Hooks | — | `.claude/settings.json` | — |

There are no Codex-specific template files beyond `AGENTS.md`.

## AGENTS.md hierarchy in Codex

Codex reads `AGENTS.md` files hierarchically:

1. `~/.codex/AGENTS.md` — global, applied to all sessions
2. Project root `AGENTS.md` — installed by Devflow
3. Any `AGENTS.md` found in subdirectories of the working directory

## Overriding instructions

Create `AGENTS.override.md` in your project root to override specific instructions
without modifying the Devflow-installed `AGENTS.md`:

```md
# My project overrides

Prefer functional components over class components.
Always use Zod for input validation.
```

Codex gives `AGENTS.override.md` precedence over `AGENTS.md`.
