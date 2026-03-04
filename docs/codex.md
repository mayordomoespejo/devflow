# Devflow — Codex CLI

## What gets installed

```txt
AGENTS.md
DEVFLOW.md
.devflow/workflows.yml
devflow/prompts/
.devflow/adapters/codex/README.md
```

## Setup checklist

- [ ] `npx devflow-agent-cli init --adapter codex` in the project root
- [ ] `AGENTS.md` exists at the project root
- [ ] `DEVFLOW.md` exists at the project root
- [ ] `devflow/prompts/` exists at the project root
- [ ] Run Codex from the project root — `AGENTS.md` is loaded automatically at session start
- [ ] Commit: `git add AGENTS.md DEVFLOW.md devflow/ .devflow/ && git commit -m "chore: add Devflow Codex workflow"`

---

## Install

```sh
npx devflow-agent-cli init --adapter codex
```

Preview first, then apply:

```sh
npx devflow-agent-cli init --adapter codex --dry-run
npx devflow-agent-cli init --adapter codex --force   # overwrite existing
```

---

## How Codex reads instructions

Codex CLI reads `AGENTS.md` automatically at session start. Devflow installs it at the project root.

Codex loads `AGENTS.md` hierarchically — all files are merged, with later entries taking precedence:

1. `~/.codex/AGENTS.md` — global, applies to every session
2. `<project>/AGENTS.md` — project-level, installed by Devflow
3. Subdirectory `AGENTS.md` files, scoped to their directory

---

## What Codex does not support

Codex is instruction-based. All workflow guidance goes through `AGENTS.md`.

| Feature | Cursor | Claude Code | Codex |
|---------|--------|-------------|-------|
| Slash commands | `.cursor/commands/` ✓ | `.claude/commands/` ✓ | — |
| Rules files | `.cursor/rules/` ✓ | `.claude/rules/` ✓ | — |
| Hooks | — | `.claude/settings.json` | — |

There are no Devflow slash commands for Codex. Everything is delivered through `AGENTS.md`.

---

## Overriding instructions without editing AGENTS.md

Create `AGENTS.override.md` at the project root. Codex gives it precedence over `AGENTS.md`:

```md
# Project overrides

Use pnpm instead of npm.
Prefer Zod for validation at system boundaries.
Prefer functional components over class components.
```

This lets you customise behaviour per project without modifying the Devflow-managed `AGENTS.md`.

---

## Scoping instructions to a subdirectory

Place an `AGENTS.md` inside any subdirectory. Codex loads it when the working directory is inside that tree:

```
my-app/
  AGENTS.md          ← loaded for all sessions
  src/
    AGENTS.md        ← additional context when working inside src/
```

---

## Troubleshooting

**Codex ignores AGENTS.md**
- Confirm `AGENTS.md` is at the project root (same level as `.git`).
- Run Codex from the project root, not a parent directory.

**Instructions from a previous session still applying**
- Codex reads `AGENTS.md` at the start of each session. Start a new session to pick up changes.

**How to add project-specific rules**
- Create `AGENTS.override.md` at the project root — Codex gives it precedence over `AGENTS.md`.
- Do not edit `AGENTS.md` directly unless you intend to manage updates manually.

**Conflict on re-install**
- `npx devflow-agent-cli init --adapter codex --dry-run` — preview what changes
- `npx devflow-agent-cli init --adapter codex --force` — overwrite Devflow-managed files
