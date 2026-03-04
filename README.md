# Devflow

Universal AI development toolkit. Installs workflow instructions, slash commands, and rules into any project — for Cursor, Claude Code, Codex CLI, and Gemini CLI.

```sh
npx devflow init
```

---

## Tool support

| | Cursor | Claude Code | Codex | Gemini |
|--|--------|-------------|-------|--------|
| Instruction file | `.cursor/rules/` | `CLAUDE.md` | `AGENTS.md` | `GEMINI.md` |
| Universal instructions | `AGENTS.md` ✓ | `AGENTS.md` ✓ | `AGENTS.md` ✓ | `AGENTS.md` ✓ |
| Slash commands | `.cursor/commands/` ✓ | `.claude/commands/` ✓ | — | — |
| Rules / style files | `.cursor/rules/` ✓ | via `CLAUDE.md` | — | — |
| Hooks | — | `.claude/settings.json` | — | — |

### Files installed per tool

#### `--tool cursor`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `.cursor/commands/plan.md` | `/plan` — step-by-step implementation plan |
| `.cursor/commands/review.md` | `/review` — senior engineer code review |
| `.cursor/commands/tests.md` | `/tests` — generate test cases |
| `.cursor/commands/verify.md` | `/verify` — verify before finishing |
| `.cursor/rules/typescript.md` | Strict TypeScript rules |

#### `--tool claude`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `CLAUDE.md` | Claude Code-specific instructions and tool-use guidance |
| `.claude/commands/plan.md` | `/plan` — step-by-step implementation plan |
| `.claude/commands/review.md` | `/review` — senior engineer code review |
| `.claude/commands/tests.md` | `/tests` — generate test cases |
| `.claude/commands/verify.md` | `/verify` — verify before finishing |

#### `--tool codex`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow (primary instruction file for Codex) |
| `.codex/README.md` | Codex CLI reference — what works, what doesn't, override pattern |

#### `--tool gemini`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `GEMINI.md` | Gemini CLI-specific instructions and context notes |

---

## Install

### Quickstart — install everything

```sh
npx devflow init
```

Installs all tools (cursor + claude + codex + gemini) into the current directory.

### Install a specific tool

```sh
npx devflow init --tool cursor
npx devflow init --tool claude
npx devflow init --tool codex
npx devflow init --tool gemini
```

### Install multiple tools

```sh
npx devflow init --tool cursor,claude
```

### Add a tool to an existing install

Use `--merge` to skip files that already exist and only add new ones:

```sh
# Already have cursor, now adding claude
npx devflow init --tool claude --merge
```

### Install into another directory

```sh
npx devflow init --target ../my-other-project
npx devflow init --tool cursor --target ~/projects/api
```

---

## Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--tool <list>` | | Comma-separated tools: `cursor`, `claude`, `codex`, `gemini`, `all`. Default: `all` |
| `--target <path>` | `-t` | Install into a different directory instead of cwd |
| `--merge` | `-m` | Skip files that already exist (add new tools without conflicts) |
| `--force` | `-f` | Overwrite existing Devflow-managed files |
| `--dry-run` | `-n` | Preview what would be written without making changes |
| `--version` | `-v` | Print version |
| `--help` | `-h` | Show help |

> `--force` takes precedence over `--merge` when both are specified.

---

## Example output

```
$ npx devflow init --tool cursor

Devflow: installing into /home/you/projects/my-app

  ✓  AGENTS.md
  ✓  .cursor/commands/plan.md
  ✓  .cursor/commands/review.md
  ✓  .cursor/commands/tests.md
  ✓  .cursor/commands/verify.md
  ✓  .cursor/rules/typescript.md

Done. Devflow installed successfully.
```

```
$ npx devflow init --tool claude --merge

Devflow: installing into /home/you/projects/my-app (merge)

  –  AGENTS.md (skipped)
  ✓  CLAUDE.md
  ✓  .claude/commands/plan.md
  ✓  .claude/commands/review.md
  ✓  .claude/commands/tests.md
  ✓  .claude/commands/verify.md

Done. Devflow installed successfully.
```

```
$ npx devflow init --dry-run

Devflow: dry run — target: /home/you/projects/my-app

  [create]    AGENTS.md
  [conflict]  .cursor/commands/plan.md
  ...

  Tip: use --force to overwrite or --merge to skip conflicts.

Dry run complete. Run without --dry-run to apply.
```

---

## Tool-specific guides

- [Cursor](docs/cursor.md)
- [Claude Code](docs/claude-code.md)
- [Codex CLI](docs/codex.md)
- [Gemini CLI](docs/gemini.md)

---

## Requirements

- Node.js 18+

## License

MIT
