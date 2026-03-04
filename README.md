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
- `.devflow/workflows.yml` - optional workflow customization contract for this project

This is the stable part of the product. If a user changes model or tool, the core still works.

## Workflow Customization

Devflow also installs an optional project file:

```txt
.devflow/workflows.yml
```

This file lets a project declare preferred workflow behavior without editing the shared prompts directly.

Example uses:

- define review focus areas such as bugs, regressions, missing tests, and security
- declare what a plan should include
- declare what verify should check before sign-off

Today, `workflows.yml` is a configuration contract for:

- humans working in the repository
- agents that read project files directly
- future Devflow versions that may interpret this config more deeply

Current behavior:

- Devflow installs the file as part of the core
- you can edit it safely per project
- the CLI does not yet parse it to rewrite prompts

That is intentional. The file exists now so projects can establish stable local workflow expectations before deeper automation is added.

### Adapters

Adapters are optional and exist only to make the core easier to use in a specific environment.

- `cursor` installs Cursor-facing command and rule files
- `claude` installs Claude Code slash commands under `.claude/commands/`
- `generic` installs usage instructions for any unsupported chat or IDE
- `codex` and `gemini` install guidance under `.devflow/adapters/` without inventing unsupported config

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
npx devflow-agent-cli init
```

Use `npx` or `npm exec` for normal usage. Avoid `npm i devflow-agent-cli` inside an existing project unless you intentionally want to add the CLI to that project's dependencies, because `npm install` resolves against the current project's dependency tree and can fail on unrelated peer conflicts.

Install with the Cursor adapter:

```sh
npx devflow-agent-cli init --adapter cursor
```

Install with the generic adapter:

```sh
npx devflow-agent-cli init --adapter generic
```

Default behavior:

- if the target already uses `.cursor/`, Devflow defaults to `cursor`
- otherwise Devflow defaults to `generic`

Useful flags:

- `--target <path>` installs into another directory
- `--merge` keeps existing files and only adds missing Devflow-managed files
- `--force` overwrites only Devflow-managed paths: `AGENTS.md`, `DEVFLOW.md`, `devflow/`, `.cursor/`, `.devflow/`
- `--dry-run` previews what would change

## Plugins

Plugins extend Devflow with additional workflow capabilities beyond the built-in adapters. Where adapters connect Devflow to AI tools, plugins add new integrations: CI configuration, security audits, company-specific rules, and more.

```sh
# Install a plugin from npm
npx devflow-agent-cli add devflow-plugin-github

# Install from a local path
npx devflow-agent-cli add ./path/to/my-plugin

# Remove a plugin
npx devflow-agent-cli remove plugin-name
```

Installed plugins are tracked in `.devflow/plugins.yml` and their health is reported by `devflow doctor`. See [docs/plugins.md](docs/plugins.md) and [docs/plugin-authoring.md](docs/plugin-authoring.md) for full details.

---

## Doctor

Use `devflow doctor` to inspect the current repository or another target and report:

- whether the core is installed correctly
- which adapters and plugins are present
- missing files
- recommended next commands

Examples:

```sh
npx devflow-agent-cli doctor
npx devflow-agent-cli doctor --target ../other-repo
npx devflow-agent-cli doctor --json
```

Useful flags:

- `--target <path>` inspects another directory
- `--json` prints JSON only
- `--verbose` includes adapter-level missing files
- `--fix` prints safe fix guidance without making destructive changes

## Explain

Use `devflow explain` to show what Devflow has installed in a repository and where the working rules come from.

It reports:

- CLI version
- installed core files and adapters
- available workflows such as `plan`, `tests`, `review`, and `verify`
- the project files that define Devflow behavior

Examples:

```sh
npx devflow-agent-cli explain
npx devflow-agent-cli explain --target ../other-repo
npx devflow-agent-cli explain --json
```

Useful flags:

- `--target <path>` inspects another directory
- `--json` prints JSON only
- `--verbose` includes exact source paths and adapter checks

## Quick Start In 30 Seconds

1. Run:

```sh
npx devflow-agent-cli init
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
| `claude` | config-backed adapter | `.claude/commands/` |
| `generic` | documentation adapter | `.devflow/README.md` |
| `codex` | documentation adapter | `.devflow/adapters/codex/README.md` |
| `gemini` | documentation adapter | `.devflow/adapters/gemini/README.md` |

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
src/             TypeScript source modules
dist/            Compiled output (generated by tsc)
templates/
  core/          Core files installed by every init
  adapters/      Adapter files (cursor, claude, generic, ...)
scripts/         Build validation, smoke tests, unit tests
docs/            User guides
examples/        Sample projects and usage examples
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

## Releases

- Current version: `0.1.0`
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Security policy: [SECURITY.md](SECURITY.md)

## Tool Guides

- [Anywhere](docs/anywhere.md)
- [Cursor](docs/cursor.md)
- [Claude Code](docs/claude.md)
- [Codex](docs/codex.md)
- [Monorepo setup](docs/monorepo.md)
- [Plugins](docs/plugins.md)
- [Plugin authoring](docs/plugin-authoring.md)

## License

MIT
