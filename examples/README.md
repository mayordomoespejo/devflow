# Devflow Examples

This folder shows how to use Devflow in a universal way, without tying the workflow to a single model or tool.

There are two practical routes:

1. `generic`: copy prompts into any chat, IDE, or harness
2. `cursor`: use the Cursor adapter, but keep the same prompts available as plain copy/paste inputs

The workflow is always the same:

```text
PLAN -> BUILD -> TEST -> REVIEW -> VERIFY
```

## Route 1: Generic

Use this when you work in a plain chat UI, terminal agent, editor plugin, or any setup without native Devflow commands.

Install:

```sh
npx devflow init --adapter generic
```

What you use:

- `AGENTS.md`
- `DEVFLOW.md`
- `devflow/prompts/plan.txt`
- `devflow/prompts/build.txt`
- `devflow/prompts/tests.txt`
- `devflow/prompts/review.txt`
- `devflow/prompts/verify.txt`

### Example: PLAN prompt

Copy and paste:

```text
Create a step-by-step implementation plan for the following task:

Add audit logging to the billing webhook.

The plan must include:

1. What needs to be built or changed
2. Which files will be affected
3. Functions, components, or types to create or modify
4. Tests that should pass when done
5. Edge cases and risks to address

Do not write any code yet. Only the plan.
```

### Example: BUILD prompt

Copy and paste after accepting the plan:

```text
Implement the agreed plan for the following task:

Add audit logging to the billing webhook.

Requirements:

1. Make the smallest working change that satisfies the plan
2. Modify existing code before adding new abstractions
3. Keep functions small and explicit
4. Preserve existing behavior outside the requested change
5. Note any follow-up risks or tradeoffs if they remain

Return the implementation and briefly explain what changed.
```

### Example: TEST prompt

Copy and paste after implementation:

```text
Generate tests for the following implementation:

Add audit logging to the billing webhook.

Cover:

- The happy path
- Edge cases identified during planning
- Error states and invalid input
- Any boundary conditions

Prefer:

- Integration tests over unit tests where they provide more confidence
- Realistic test data over artificial fixtures
- Minimal mocking where feasible

Provide the test code ready to run.
```

### Example: REVIEW prompt

Copy and paste when reviewing:

```text
Review the following implementation as a senior engineer.

The change adds audit logging to the billing webhook.

Check for:

- Bugs and logic errors
- Unhandled edge cases
- Security issues
- Duplicated logic
- Unnecessary complexity
- Performance issues that matter in production

Be specific. For each issue found, describe the problem and suggest a fix.
```

### Example: VERIFY prompt

Copy and paste before finishing:

```text
Verify this implementation against the original plan.

The task was to add audit logging to the billing webhook.

Check each of the following and report the result:

1. Does the code compile or run without errors?
2. Do tests pass?
3. Are edge cases from the plan handled?
4. Is duplicated logic introduced?
5. Could the solution be simpler without losing correctness?
6. Is any sensitive data exposed?

For each issue found, describe it clearly and suggest how to resolve it.
If everything looks good, confirm it is ready to ship.
```

## Route 2: Cursor

Use this when you want the same Devflow workflow exposed inside Cursor.

Install:

```sh
npx devflow init --adapter cursor
```

What you get:

- all core files
- `.cursor/commands/plan.md`
- `.cursor/commands/tests.md`
- `.cursor/commands/review.md`
- `.cursor/commands/verify.md`
- `.cursor/rules/typescript.md`

### Cursor path A: use native commands

In Cursor chat:

```text
/plan add audit logging to the billing webhook
/tests cover invalid payloads and retry handling
/review focus on duplicate logic and security
/verify against the accepted plan
```

### Cursor path B: use plain copy/paste prompts

You can still use the exact same generic prompts inside Cursor chat.

Example:

```text
Create a step-by-step implementation plan for the following task:

Add audit logging to the billing webhook.

The plan must include:

1. What needs to be built or changed
2. Which files will be affected
3. Functions, components, or types to create or modify
4. Tests that should pass when done
5. Edge cases and risks to address

Do not write any code yet. Only the plan.
```

This matters because the prompts are the portable source of truth. Slash commands are just a convenience layer.

## Recommended Demo Flow

If you want to evaluate Devflow quickly:

1. Pick a small real task in a sample repo
2. Run `npx devflow init --adapter generic` or `npx devflow init --adapter cursor`
3. Do one full cycle: `PLAN -> BUILD -> TEST -> REVIEW -> VERIFY`
4. Compare the result to your usual AI workflow: smaller diff, clearer plan, better tests, fewer missed edge cases

## Related Guides

- [Anywhere](../docs/anywhere.md)
- [Cursor](../docs/cursor.md)
