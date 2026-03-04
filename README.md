# Devflow

Portable AI development workflow for real projects.

Devflow standardises how you work with AI to build software: `PLAN -> BUILD -> TEST -> REVIEW -> VERIFY`. It gives you a small universal core you can install in any repository, then optional adapters for supported tools or generic usage.

```sh
npx devflow init
```

## What problem it solves

Without a shared workflow, AI-assisted development tends to drift:

- every project ends up with different prompts
- quality depends on the current model or tool
- agents jump into code before understanding the task
- tests, review, and edge-case checks are inconsistent
- long sessions lose context and engineering discipline

Devflow makes the process repeatable, regardless of model or interface.

## Product model

Devflow has two layers:

- Core: always installed, model-agnostic, tool-agnostic
- Adapters: optional integrations for specific tools

The core is the actual product. Adapters only map that core into the conventions of each tool.

## What `devflow init` installs

By default, `npx devflow init` installs the universal core only:

- `AGENTS.md` - baseline agent behaviour and engineering principles
- `DEVFLOW.md` - the workflow reference
- `devflow/prompts/` - reusable prompts for `plan`, `build`, `tests`, `review`, and `verify`

Add an adapter when you want native integration:

```sh
npx devflow init --adapter cursor
npx devflow init --adapter claude
npx devflow init --adapter codex
npx devflow init --adapter generic
```

Install everything explicitly:

```sh
npx devflow init --adapter all
```

`--tool` remains available as a backward-compatible alias for `--adapter`.

## Quick start

Install the core in any repo:

```sh
npx devflow init
```

Install the core plus one adapter:

```sh
npx devflow init --adapter cursor
```

Preview changes first:

```sh
npx devflow init --adapter claude --dry-run
```

Add another adapter later without overwriting existing files:

```sh
npx devflow init --adapter codex --merge
```

Refresh Devflow-managed files:

```sh
npx devflow init --adapter all --force
```

## Workflow

The workflow is intentionally simple:

1. `PLAN` - understand the task, affected files, tests, and risks
2. `BUILD` - change the minimum necessary code
3. `TEST` - cover the happy path, edge cases, and failures
4. `REVIEW` - look for bugs, security issues, duplication, and unnecessary complexity
5. `VERIFY` - confirm the implementation matches the plan and is ready to ship

This is the standard Devflow tries to install in every project, independent of model.

## Adapters

| Adapter | Installs | Best for |
| --- | --- | --- |
| `cursor` | `.cursor/commands/` and `.cursor/rules/` | Cursor IDE users |
| `claude` | `.devflow/adapters/claude-code/README.md` | Claude Code users documenting a manual setup |
| `codex` | `.devflow/adapters/codex/README.md` | Codex users relying on `AGENTS.md` |
| `generic` | `.devflow/README.md` | Any chat UI or unsupported tool |

## CLI flags

| Flag | Short | Description |
| --- | --- | --- |
| `--adapter <list>` | | Comma-separated adapters: `cursor`, `claude`, `codex`, `generic`, `all` |
| `--tool <list>` | | Deprecated alias for `--adapter` |
| `--target <path>` | `-t` | Install into another directory |
| `--merge` | `-m` | Skip files that already exist |
| `--force` | `-f` | Overwrite Devflow-managed files |
| `--dry-run` | `-n` | Preview without writing |
| `--version` | `-v` | Print version |
| `--help` | `-h` | Show help |

## Design constraints

Devflow is intentionally narrow:

- it does not try to orchestrate fleets of agents
- it does not depend on one model vendor
- it does not add dangerous automation by default
- it prefers explicit files over hidden behaviour

That tradeoff is deliberate. The goal is portability, consistency, and maintainability.

## Success criteria

A good Devflow installation should let a user:

- install a reusable workflow in 10 to 30 seconds
- get the same engineering process across projects and tools
- reduce prompt sprawl and session drift
- produce smaller diffs, cleaner PRs, and fewer avoidable bugs

## Repository structure

```txt
src/cli.js
templates/
  core/
  prompts/
  adapters/
docs/
examples/
scripts/
```

## Verification

Run the repository checks locally:

```sh
npm test
```

This validates required templates and runs an end-to-end smoke test of the CLI installer.

## Tool guides

- [Cursor](docs/cursor.md)
- [Claude Code](docs/claude-code.md)
- [Codex](docs/codex.md)
- [Gemini](docs/gemini.md)
- [Generic](docs/generic.md)

## License

MIT
