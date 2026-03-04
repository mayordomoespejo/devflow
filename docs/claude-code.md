# Devflow — Claude Code

## What gets installed

```
AGENTS.md
CLAUDE.md
.claude/
  commands/
    plan.md
    review.md
    tests.md
    verify.md
```

## Install

```sh
npx devflow init --tool claude
```

## CLAUDE.md vs AGENTS.md

Both files are read by Claude Code automatically:

| File | Read by | Purpose |
|------|---------|---------|
| `AGENTS.md` | Claude Code, Codex | Universal workflow — shared across all tools |
| `CLAUDE.md` | Claude Code only | Claude-specific instructions: tool use, slash commands, destructive command policy |

If you already have a `CLAUDE.md`, use `--merge` to avoid overwriting it:

```sh
npx devflow init --tool claude --merge
```

`--merge` installs only files that don't exist yet, so your custom `CLAUDE.md` stays untouched.

## Using the commands

Type a slash command in the Claude Code chat:

| Command | What it does |
|---------|-------------|
| `/plan <topic>` | Generates a step-by-step implementation plan |
| `/review` | Reviews the current implementation as a senior engineer |
| `/tests` | Generates test cases for the current implementation |
| `/verify` | Checks correctness, edge cases, and simplicity before finishing |

Commands accept an optional argument after the slash: `/plan add dark mode` passes "add dark mode" as `$ARGUMENTS` to the command template.

Commands live in `.claude/commands/`. Claude Code picks them up without restart.

## Customising CLAUDE.md

`CLAUDE.md` supports hierarchical loading:

- `~/.claude/CLAUDE.md` — global, applies to all projects
- `<project>/CLAUDE.md` — project-level, installed by Devflow

Add project-specific instructions directly to `<project>/CLAUDE.md`. Devflow manages only the content it installed; the rest is yours.

## Updating Devflow files

```sh
# Preview what would change
npx devflow init --tool claude --dry-run

# Overwrite with the latest templates
npx devflow init --tool claude --force
```

## Troubleshooting

**CLAUDE.md not being read**
- Confirm it's at the project root (same level as `package.json` or `.git`).
- Claude Code loads `CLAUDE.md` from the working directory and parent directories up to the git root.

**Commands don't appear**
- Confirm `.claude/commands/` exists at the project root.
- Commands are auto-discovered — no restart required.

**`/plan` outputs nothing useful**
- Pass a topic: `/plan implement user authentication`.
- If you get an empty `$ARGUMENTS` substitution, the command template still works — it uses the current conversation context.

**Conflict on re-install**
- Use `--force` to overwrite: `npx devflow init --tool claude --force`
- Use `--merge` to skip existing files: `npx devflow init --tool claude --merge`
