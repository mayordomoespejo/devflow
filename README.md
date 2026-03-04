# Devflow

Lightweight AI-assisted development toolkit for [Cursor](https://cursor.sh). Installs workflow rules and slash commands into any project with one command.

## What it installs

| File | Purpose |
|------|---------|
| `AGENTS.md` | AI workflow guidance and engineering principles |
| `.cursor/commands/plan.md` | `/plan` — generate an implementation plan |
| `.cursor/commands/review.md` | `/review` — senior engineer code review |
| `.cursor/commands/tests.md` | `/tests` — generate test cases |
| `.cursor/commands/verify.md` | `/verify` — verify correctness before finishing |
| `.cursor/rules/typescript.md` | Strict TypeScript rules for Cursor |

## Installation

```sh
npm install -g devflow
```

Or use without installing:

```sh
npx devflow init
```

## Usage

### Basic install

```sh
devflow init
```

Copies all Devflow files into the current directory. Aborts if any file already exists.

### Flags

| Flag | Description |
|------|-------------|
| `-f, --force` | Overwrite existing files |
| `-n, --dry-run` | Preview what would be copied, without writing |
| `-t, --target <path>` | Install into a different directory |
| `-v, --version` | Print version |
| `-h, --help` | Show help |

### Examples

```sh
# Preview before installing
devflow init --dry-run

# Install into another project
devflow init --target ../my-other-project

# Overwrite existing Devflow files
devflow init --force

# Combine flags
devflow init --target ~/projects/api --force
```

## Example output

```
$ devflow init

Devflow: installing into /Users/you/projects/my-app

  ✓  AGENTS.md
  ✓  .cursor/commands/plan.md
  ✓  .cursor/commands/review.md
  ✓  .cursor/commands/tests.md
  ✓  .cursor/commands/verify.md
  ✓  .cursor/rules/typescript.md

Done. Devflow installed successfully.
```

```
$ devflow init --dry-run

Devflow: dry run — target: /Users/you/projects/my-app

  [create]    AGENTS.md
  [create]    .cursor/commands/plan.md
  [overwrite] .cursor/commands/review.md

Dry run complete. Run without --dry-run to apply.
```

## Requirements

- Node.js 18+

## License

MIT
