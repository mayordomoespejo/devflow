# Devflow — Gemini CLI

## What gets installed

```
AGENTS.md
.gemini/
  INSTRUCTIONS.md   ← reference doc, not auto-read by Gemini
```

## Setup checklist

- [ ] `npx devflow init --tool gemini` in the project root
- [ ] `AGENTS.md` exists at the project root
- [ ] `.gemini/INSTRUCTIONS.md` exists
- [ ] **Optional but recommended:** create `GEMINI.md` at the project root so Gemini auto-loads the workflow (see below)
- [ ] Commit: `git add AGENTS.md .gemini && git commit -m "chore: add Devflow Gemini workflow"`

---

## Install

```sh
npx devflow init --tool gemini
```

Preview first, then apply:

```sh
npx devflow init --tool gemini --dry-run
npx devflow init --tool gemini --force   # overwrite existing
```

---

## How Gemini reads instructions

Gemini CLI reads `GEMINI.md` files hierarchically and merges them all:

1. `~/.gemini/GEMINI.md` — global, applies to every session
2. `<project>/GEMINI.md` — project-level
3. Subdirectory `GEMINI.md` files, scoped to their directory

All files are sent to the model with every prompt.

**Important:** Devflow installs `AGENTS.md` (the universal workflow) and `.gemini/INSTRUCTIONS.md` (a reference doc). Gemini does not read either file automatically — it reads `GEMINI.md` files, which Devflow does not install by default. See [Activating the workflow](#activating-the-workflow-with-gemini) below.

---

## Activating the workflow with Gemini

To make Gemini load the Devflow workflow automatically, create `GEMINI.md` at your project root after installing:

```sh
npx devflow init --tool gemini

# Then create GEMINI.md that imports AGENTS.md
cat > GEMINI.md << 'EOF'
# Project AI workflow

@./AGENTS.md
EOF
```

The `@` syntax tells Gemini to inline the referenced file. This keeps `AGENTS.md` as the single source of truth while making it readable by Gemini.

Alternatively, paste the relevant sections from `AGENTS.md` directly into `GEMINI.md`.

---

## What Gemini does not support

Gemini is instruction-based. All workflow guidance goes through `GEMINI.md` / `AGENTS.md`.

| Feature | Cursor | Claude Code | Gemini |
|---------|--------|-------------|--------|
| Slash commands | `.cursor/commands/` ✓ | `.claude/commands/` ✓ | — |
| Rules files | `.cursor/rules/` ✓ | `.claude/rules/` ✓ | — |
| Hooks | — | `.claude/settings.json` | — |

There are no Devflow slash commands for Gemini. Everything is delivered through instruction files.

---

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

---

## Persistent memory

Use in-session commands to manage context:

```sh
/memory add Always prefer pnpm over npm in this project.
/memory refresh   # reload GEMINI.md files mid-session without restarting
```

---

## Overriding instructions without editing AGENTS.md

Create `AGENTS.override.md` at the project root and reference it from `GEMINI.md`:

```md
# GEMINI.md
@./AGENTS.md
@./AGENTS.override.md
```

`AGENTS.override.md` contains your project-specific rules. `AGENTS.md` stays untouched and can be updated with `--force`.

---

## .gemini/INSTRUCTIONS.md

This file is a reference document. It explains:
- How Gemini loads instruction files
- What Gemini supports vs what it does not
- The override pattern for project-specific rules

Gemini does not read it automatically. It is there for developers setting up or extending the Devflow integration.

---

## Troubleshooting

**Gemini ignores my instructions**
- Gemini reads `GEMINI.md`, not `AGENTS.md` directly. Create `GEMINI.md` at the project root and import `AGENTS.md` with `@./AGENTS.md`.
- Confirm `GEMINI.md` is at the project root (same level as `.git`).
- Run Gemini from the project root, not a parent directory.

**Changes to AGENTS.md not picked up**
- Use `/memory refresh` inside a running session to reload instruction files without restarting.

**Subdirectory GEMINI.md not loading**
- Confirm Gemini is running with the project root in scope, not from a parent directory.

**Conflict on re-install**
- `npx devflow init --tool gemini --dry-run` — preview what changes
- `npx devflow init --tool gemini --force` — overwrite Devflow-managed files
- `npx devflow init --tool gemini --merge` — skip existing, add only new files
