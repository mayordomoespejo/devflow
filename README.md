# Devflow

Opinionated AI workflow kit for software teams. One command installs a consistent set of instructions, slash commands, and coding rules into your project — ready for Cursor, Claude Code, Codex CLI, and Gemini CLI.

```sh
npx devflow init
```

---

## Quick start (30 seconds)

```sh
# Install everything into the current project
npx devflow init

# Or pick just the tools you use
npx devflow init --tool cursor
npx devflow init --tool claude
npx devflow init --tool codex
npx devflow init --tool gemini
```

**Recommended flow for new projects:**

```sh
# 1. Run once — installs all tool targets
npx devflow init

# 2. Commit the installed files alongside your code
git add AGENTS.md .cursor .claude .codex .gemini
git commit -m "chore: add Devflow AI workflow files"

# 3. When Devflow releases updates, refresh with --force
npx devflow init --force
```

---

## What it installs

Every install always includes:

- **`AGENTS.md`** — universal engineering principles, workflow steps, and code quality rules (read by all four tools)

Then, per tool:

| Tool | Target dir | Installed files |
|------|-----------|-----------------|
| `cursor` | `.cursor/` | 4 slash commands + TypeScript rules |
| `claude` | `.claude/` | 4 slash commands + TypeScript rules |
| `codex` | `.codex/` | Reference doc (instruction-based, no commands) |
| `gemini` | `.gemini/` | Reference doc (instruction-based, no commands) |

---

## Tool support

| Tool | Installed files | What you get | Limitations |
|------|----------------|--------------|-------------|
| **Cursor** | `AGENTS.md` · `.cursor/commands/` · `.cursor/rules/` | `/plan` `/review` `/tests` `/verify` slash commands + always-on TypeScript rules | — |
| **Claude Code** | `AGENTS.md` · `.claude/commands/` · `.claude/rules/` | `/plan` `/review` `/tests` `/verify` slash commands + TypeScript rules | — |
| **Codex CLI** | `AGENTS.md` · `.codex/INSTRUCTIONS.md` | Universal workflow via `AGENTS.md`; reference doc in `.codex/` | Instruction-based only — no commands, no rules files |
| **Gemini CLI** | `AGENTS.md` · `.gemini/INSTRUCTIONS.md` | Universal workflow via `AGENTS.md`; reference doc in `.gemini/` | Instruction-based only — no commands, no rules files |

### Files installed per tool

#### `--tool cursor`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `.cursor/commands/plan.md` | `/plan` — step-by-step implementation plan |
| `.cursor/commands/review.md` | `/review` — senior engineer code review |
| `.cursor/commands/tests.md` | `/tests` — generate test cases |
| `.cursor/commands/verify.md` | `/verify` — verify before finishing |
| `.cursor/rules/typescript.md` | Always-on strict TypeScript rules |

#### `--tool claude`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `.claude/commands/plan.md` | `/plan` — step-by-step implementation plan |
| `.claude/commands/review.md` | `/review` — senior engineer code review |
| `.claude/commands/tests.md` | `/tests` — generate test cases |
| `.claude/commands/verify.md` | `/verify` — verify before finishing |
| `.claude/rules/typescript.md` | Always-on strict TypeScript rules |

#### `--tool codex`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow (primary instruction file for Codex) |
| `.codex/INSTRUCTIONS.md` | Reference: how Codex reads files, override pattern |

#### `--tool gemini`
| Destination | Purpose |
|-------------|---------|
| `AGENTS.md` | Universal workflow and engineering principles |
| `.gemini/INSTRUCTIONS.md` | Reference: how Gemini reads files, override pattern |

---

## Installation

### Install everything (default)

```sh
npx devflow init
```

Installs all four tool targets into the current directory.

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

Use `--merge` to skip files that already exist and only add the new ones:

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
| `--merge` | `-m` | Skip files that already exist (safe way to add a second tool) |
| `--force` | `-f` | Overwrite existing Devflow-managed files only (`AGENTS.md`, `.cursor`, `.claude`, `.codex`, `.gemini`) |
| `--dry-run` | `-n` | Preview what would be written without making changes |
| `--version` | `-v` | Print version |
| `--help` | `-h` | Show help |

> `--force` takes precedence over `--merge` when both are specified. It will never touch files outside Devflow-managed paths.

---

## How it works

```
templates/
  common/AGENTS.md          ← always installed to target root
  cursor/.cursor/           ← copied verbatim to target/.cursor/
  claude/.claude/           ← copied verbatim to target/.claude/
  codex/                    ← copied to target/.codex/
  gemini/                   ← copied to target/.gemini/
```

`devflow init` resolves the selected tools, builds a flat list of `{ src → dest }` pairs, and copies each file to the target directory. After copying, it validates that key files are present and exits with a non-zero code if any are missing.

No network requests. No build step. Pure file copy.

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
  ✓  .claude/commands/plan.md
  ✓  .claude/commands/review.md
  ✓  .claude/commands/tests.md
  ✓  .claude/commands/verify.md
  ✓  .claude/rules/typescript.md

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

## Roadmap

- [ ] `devflow update` — pull latest template versions into an existing install
- [ ] `devflow eject` — remove all Devflow-managed files from a project
- [ ] Per-project config (`.devflowrc`) to persist tool and target preferences
- [ ] Project-type presets (e.g. `--preset next`, `--preset node-api`)
- [ ] Node 22 CI matrix
- [ ] npm publish workflow

---

## Releases

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

Latest release: **v0.1.0** — initial multi-tool release (Cursor, Claude Code, Codex, Gemini).

---

## Tool-specific guides

- [Cursor](docs/cursor.md)
- [Claude Code](docs/claude-code.md)
- [Codex CLI](docs/codex.md)
- [Gemini CLI](docs/gemini.md)

---

## Requirements

- Node.js 18+

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT
