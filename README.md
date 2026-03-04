# Devflow

Devflow is a universal AI development workflow for real software projects.

It gives you three things:

- a shared workflow: `PLAN -> BUILD -> TEST -> REVIEW -> VERIFY`
- portable prompts you can reuse in any chat, IDE, or terminal workflow
- optional adapters that map the workflow into specific tool conventions when that mapping is clear

Devflow is designed to be model-agnostic and harness-agnostic. It works with any model, including Claude, Gemini, GPT, and similar systems, without making your project depend on one vendor or one interface.

## What Devflow installs

Devflow has two layers:

- Core: always installed
- Adapters: optional

The core is the source of truth. Adapters are thin additions on top.

### Core

Every installation includes:

- `AGENTS.md` - universal instructions for the agent working in the repo
- `DEVFLOW.md` - the workflow reference for `PLAN -> BUILD -> TEST -> REVIEW -> VERIFY`
- `devflow/prompts/` - reusable prompts for `plan`, `build`, `tests`, `review`, and `verify`

This is the stable part of the product. If a user changes model or tool, the core still works.

### Adapters

Adapters are optional and exist only to make the core easier to use in a specific environment.

- `cursor` installs Cursor-facing command and rule files
- `generic` installs usage instructions for any unsupported chat or IDE
- `claude-code` and `codex` currently install guidance under `.devflow/adapters/` without inventing unsupported config

If Devflow does not know a tool's official integration format, it does not fake one.

## Works With Any Model

Devflow is not tied to a specific model provider.

You can use the same workflow with:

- Claude
- Gemini
- GPT
- local models
- any future model that can read instructions and generate code

The model can change. The engineering process should not.

## Installation

Install into the current repository:

```sh
npx devflow init
```

Install with the Cursor adapter:

```sh
npx devflow init --adapter cursor
```

Install with the generic adapter:

```sh
npx devflow init --adapter generic
```

Default behavior:

- if the target already uses `.cursor/`, Devflow defaults to `cursor`
- otherwise Devflow defaults to `generic`

Useful flags:

- `--target <path>` installs into another directory
- `--merge` keeps existing files and only adds missing Devflow-managed files
- `--force` overwrites only Devflow-managed paths: `AGENTS.md`, `DEVFLOW.md`, `devflow/`, `.cursor/`, `.devflow/`
- `--dry-run` previews what would change

## Quick Start In 30 Seconds

1. Run:

```sh
npx devflow init
```

2. Open the installed files:

- `AGENTS.md`
- `DEVFLOW.md`
- `devflow/prompts/plan.txt`

3. Start every non-trivial task with the workflow:

- `PLAN` - understand the task, touched files, tests, and risks
- `BUILD` - implement the smallest correct change
- `TEST` - cover happy path, edge cases, and failures
- `REVIEW` - inspect for bugs, security issues, duplication, and unnecessary complexity
- `VERIFY` - confirm the result matches the plan and is ready to ship

4. If your tool supports native commands, install an adapter. If not, copy the prompts into your normal chat or IDE flow.

That is the whole point of Devflow: one process, many tools.

## How Adapters Work

Adapters do not replace the core. They only package it for a specific environment.

Current adapter model:

| Adapter | Type | Installed path |
| --- | --- | --- |
| `cursor` | config-backed adapter | `.cursor/commands/`, `.cursor/rules/` |
| `generic` | documentation adapter | `.devflow/README.md` |
| `claude-code` | documentation adapter | `.devflow/adapters/claude-code/README.md` |
| `codex` | documentation adapter | `.devflow/adapters/codex/README.md` |

This keeps the product honest:

- the workflow is universal
- integrations are optional
- unsupported formats stay as documentation until there is a clear contract

## Why This Exists

AI-assisted development often degrades because teams keep changing prompts, models, and tools without keeping the engineering process stable.

Typical failure modes:

- coding starts before the problem is understood
- tests are skipped or generated too late
- review becomes optional
- quality depends on the current chat session
- every repository grows its own inconsistent prompt folklore

Devflow gives the repo a stable process instead of relying on one person's memory or one tool's defaults.

## Repository Structure

```txt
src/cli.js
templates/
  core/
  prompts/
  adapters/
scripts/
docs/
examples/
```

`templates/` is the source of truth for what `devflow init` installs.

## Roadmap

Near term:

- keep the core stable and minimal
- improve adapter documentation quality
- harden CLI validation and smoke coverage
- align docs and examples around the same contract

Later, if clearly supported by each tool:

- add more config-backed adapters only when the integration format is verified
- improve adapter auto-detection where it is low-risk
- expand prompt packs for common repo workflows without bloating the core

Not planned:

- vendor lock-in
- model-specific workflow forks
- hidden automation that rewrites arbitrary project files

## Verification

Run the local checks:

```sh
npm test
```

This validates the template contract and runs the CLI smoke test.

## Tool Guides

- [Anywhere](docs/anywhere.md)
- [Cursor](docs/cursor.md)
- [Claude Code](docs/claude-code.md)
- [Codex](docs/codex.md)

## License

MIT
