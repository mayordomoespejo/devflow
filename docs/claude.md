# Devflow — Claude

Use this adapter when you want Devflow guidance for Claude-based tools without relying on an auto-installed native integration.

## What gets installed

```txt
AGENTS.md
DEVFLOW.md
.devflow/workflows.yml
devflow/prompts/
.devflow/adapters/claude/README.md
```

## Install

```sh
npx devflow init --adapter claude
```

Preview first:

```sh
npx devflow init --adapter claude --dry-run
```

## How to use it

1. Start from `AGENTS.md`
2. Use `DEVFLOW.md` for the workflow contract
3. Point the model to `.devflow/workflows.yml` if your project customizes review, plan, or verify expectations
4. Reuse the prompts in `devflow/prompts/`

This adapter is documentation-only for now. Devflow does not invent a Claude-specific config format unless the integration contract is clear and stable.

## Best fit

- Claude browser chat
- Claude-based terminal or IDE workflows without a stable installable config contract
- Teams that want explicit Claude guidance but still keep the universal core as the source of truth
