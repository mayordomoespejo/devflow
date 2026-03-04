# Devflow In Cursor

This guide explains how to use Devflow with the Cursor adapter.

Use this path when you want the universal Devflow core plus Cursor-native commands and rules.

## What gets installed

When you run:

```sh
npx devflow-cli init --adapter cursor
```

Devflow installs:

```txt
AGENTS.md
DEVFLOW.md
devflow/prompts/
.cursor/
  commands/
    plan.md
    build.md
    tests.md
    review.md
    verify.md
  rules/
    typescript.md
```

The core remains the source of truth. The Cursor adapter only exposes that workflow through Cursor-friendly files.

## How To Use It

Use the same Devflow phase order in Cursor:

1. `PLAN`
2. `BUILD`
3. `TEST`
4. `REVIEW`
5. `VERIFY`

Recommended flow:

1. Run `npx devflow-cli init --adapter cursor`
2. Open the repository in Cursor
3. Start in chat with `/plan`
4. Run `/build` to implement the agreed plan
5. Run `/tests`
6. Run `/review`
7. Run `/verify`

## Commands

The adapter installs these command files:

| Command | Purpose |
| --- | --- |
| `/plan` | Produce an implementation plan before coding |
| `/build` | Implement the agreed plan with minimum scope |
| `/tests` | Generate or improve tests for the current implementation |
| `/review` | Review the implementation as a senior engineer |
| `/verify` | Verify the work against the plan before finishing |

If you need more context, include it after the command in chat.

Examples:

```text
/plan add audit logging to the billing webhook
/build implement the accepted plan
/tests cover invalid token and expired session cases
/review focus on error handling and duplicated logic
/verify against the accepted plan
```

## Role Of Each File

- `AGENTS.md` defines the repo-level working style and engineering principles
- `DEVFLOW.md` defines the workflow contract
- `devflow/prompts/` gives you portable prompts you can still reuse outside Cursor
- `.cursor/commands/` maps Devflow phases to Cursor commands
- `.cursor/rules/typescript.md` adds a baseline TypeScript preference set

## Checklist

- [ ] Run `npx devflow-cli init --adapter cursor` in the repository root
- [ ] Confirm `AGENTS.md` exists
- [ ] Confirm `DEVFLOW.md` exists
- [ ] Confirm `devflow/prompts/plan.txt` exists
- [ ] Confirm `.cursor/commands/plan.md` exists
- [ ] Confirm `.cursor/commands/build.md` exists
- [ ] Confirm `.cursor/commands/tests.md` exists
- [ ] Confirm `.cursor/commands/review.md` exists
- [ ] Confirm `.cursor/commands/verify.md` exists
- [ ] Confirm `.cursor/rules/typescript.md` exists
- [ ] Use `/plan` before making a non-trivial change
- [ ] Finish with `/verify` before considering the task done

## Troubleshooting

### Commands do not appear in Cursor

- Confirm `.cursor/commands/` exists in the project root
- Confirm the files are Markdown files named `plan.md`, `build.md`, `tests.md`, `review.md`, `verify.md`
- Reopen the project in Cursor if the files were added while it was already open

### The wrong adapter was installed by default

- `devflow init` chooses `cursor` only when the target already contains `.cursor/`
- If you want Cursor explicitly, run `npx devflow-cli init --adapter cursor`

### Reinstalling causes conflicts

- Use `--dry-run` to preview changes
- Use `--merge` to keep existing files and install only missing Devflow-managed files
- Use `--force` to overwrite only Devflow-managed paths

Examples:

```sh
npx devflow-cli init --adapter cursor --dry-run
npx devflow-cli init --adapter cursor --merge
npx devflow-cli init --adapter cursor --force
```

### Cursor commands exist but the workflow still feels inconsistent

- Check that the team is actually following `PLAN -> BUILD -> TEST -> REVIEW -> VERIFY`
- Treat `.cursor/commands/` as an interface, not as the source of truth
- Fall back to `DEVFLOW.md` and `devflow/prompts/` when a task needs more explicit structure

## When To Use Another Guide

- Use [Anywhere](anywhere.md) if you are working in a plain chat, another IDE, or a terminal harness without native Cursor commands
- Use the adapter-specific README files under `.devflow/adapters/` only when you intentionally want guidance for those environments
