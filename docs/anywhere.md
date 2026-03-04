# Devflow Anywhere

This guide explains how to use Devflow in any chat, IDE, CLI, or harness, even when there is no native integration.

Use this approach with browser chats, terminal-based agents, editor plugins, local models, or any workflow where you can paste instructions manually.

## What To Install

The most portable setup is:

```sh
npx devflow-agent-cli init
```

Prefer `npx` or `npm exec` over `npm i devflow-agent-cli`. Installing the package into an existing project is unnecessary for normal use and can fail if that project already has peer dependency conflicts.

If you want explicit guidance files for non-integrated environments, use:

```sh
npx devflow-agent-cli init --adapter generic
```

That gives you the universal core:

```txt
AGENTS.md
DEVFLOW.md
.devflow/workflows.yml
devflow/prompts/
```

And, with `--adapter generic`, also:

```txt
.devflow/README.md
```

## How To Use Devflow In Any Environment

Devflow is built around one fixed sequence:

1. `PLAN`
2. `BUILD`
3. `TEST`
4. `REVIEW`
5. `VERIFY`

Use that sequence regardless of model or interface.

### Minimal flow

1. Start by giving the agent the repository context and `AGENTS.md`
2. If present, also point the agent to `.devflow/workflows.yml`
3. Use `devflow/prompts/plan.txt`
4. After the plan is accepted, implement the change
5. Use `devflow/prompts/tests.txt`
6. Use `devflow/prompts/review.txt`
7. Use `devflow/prompts/verify.txt`

## What Each Prompt Is For

| File | Use it when |
| --- | --- |
| `devflow/prompts/plan.txt` | Before writing code |
| `devflow/prompts/build.txt` | When implementing an accepted plan |
| `devflow/prompts/tests.txt` | After implementation |
| `devflow/prompts/review.txt` | When reviewing for bugs and quality issues |
| `devflow/prompts/verify.txt` | Before finishing the task |

`.devflow/workflows.yml` is the optional project-level customization file. It does not replace the prompts, but it can declare how this repository wants `plan`, `review`, or `verify` to behave.

## Example Session

### PLAN

Paste `devflow/prompts/plan.txt` and add your task.

Example:

```text
Create a step-by-step implementation plan for the following task:

Add audit logging to the billing webhook.
```

### BUILD

Once you accept the plan, use the build prompt or instruct the agent to implement the approved plan with minimal changes.

### TEST

Ask for tests that cover:

- happy path
- edge cases from the plan
- error states

### REVIEW

Ask for a senior-level review focused on:

- bugs
- missed edge cases
- unnecessary complexity
- security and data handling

### VERIFY

Before you finish, verify that:

- the implementation matches the plan
- tests pass
- no obvious risks remain

## Checklist

- [ ] Run `npx devflow-agent-cli init` or `npx devflow-agent-cli init --adapter generic`
- [ ] Open `AGENTS.md`
- [ ] Open `DEVFLOW.md`
- [ ] Open `.devflow/workflows.yml` if present
- [ ] Confirm `devflow/prompts/plan.txt` exists
- [ ] Use `PLAN` before non-trivial code changes
- [ ] Use `TEST`, `REVIEW`, and `VERIFY` before calling the work complete
- [ ] Keep the workflow stable even if the model or interface changes

## Troubleshooting

### The AI starts coding immediately without planning

- Paste `devflow/prompts/plan.txt` first
- Make the agent commit to files, tests, and edge cases before implementation
- If needed, restate that no code should be written yet

### The model ignores repository-specific constraints

- Start by sharing `AGENTS.md`
- Point the agent to `DEVFLOW.md`
- Re-anchor the session when context drifts instead of continuing with a bad thread

### The workflow feels too manual

- That is expected in non-integrated environments
- Devflow keeps the process portable first; convenience comes second
- If your team standardizes on Cursor, use the Cursor adapter for a tighter interface

### Different teammates use different models

- That is exactly what Devflow is for
- Keep the repository-level core files the same
- Let each person use their preferred model while preserving the same engineering workflow

### Reinstalling would overwrite my files

- Use `--dry-run` first
- Use `--merge` to add only missing Devflow-managed files
- Use `--force` only when you want to refresh Devflow-managed paths

Examples:

```sh
npx devflow-agent-cli init --dry-run
npx devflow-agent-cli init --merge
npx devflow-agent-cli init --force
```

## When To Use Cursor Instead

Use [Cursor](cursor.md) when you want Devflow phases exposed as native Cursor commands instead of manually pasting prompts.
