# Devflow — Generic

Use this adapter when your AI tool does not support native commands or rules, or when you want a workflow that works in any plain chat UI.

## What gets installed

```txt
AGENTS.md
DEVFLOW.md
.devflow/workflows.yml
devflow/prompts/
.devflow/README.md
```

## Install

```sh
npx devflow-agent-cli init --adapter generic
```

Preview first:

```sh
npx devflow-agent-cli init --adapter generic --dry-run
```

## How to use it

1. Start the session with the contents of `AGENTS.md`.
2. Use `devflow/prompts/plan.txt` before writing code.
3. Implement the minimum change required.
4. Use `devflow/prompts/tests.txt` after implementation.
5. Use `devflow/prompts/review.txt` for a senior-quality review.
6. Use `devflow/prompts/verify.txt` before shipping.

`.devflow/README.md` explains the same flow for plain-chat environments.

## Best fit

- ChatGPT, Claude, Gemini, or other browser chat UIs
- Unsupported IDEs or CLIs
- Teams that want the portable core without tool-specific integration
