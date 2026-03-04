# Devflow — Universal Workflow

This file defines the five-phase development workflow. It applies regardless of which AI model or tool you use.

---

## The five phases

```
PLAN → BUILD → TEST → REVIEW → VERIFY
```

Always follow this order. Do not skip phases when working on non-trivial tasks.

---

## PLAN

**When:** Before writing any code.

**What the AI should produce:**
- A summary of what needs to be built and why
- The minimal set of files that will change
- Functions, components, or types to create or modify
- Tests that should exist when done
- Edge cases and risks to address

**Prompt (paste into any chat):**

> Create a step-by-step implementation plan for: [describe your task]
>
> Include: what to build, which files change, what tests must pass, and potential edge cases.
> Do not write code yet.

---

## BUILD

**When:** After the plan is agreed.

**What the AI should produce:**
- The minimal working implementation that satisfies the plan
- No gold-plating, no speculative abstractions
- Code that compiles and passes existing tests

**Principles:**
- Modify existing code before creating new abstractions
- Prefer explicit types, early returns, small functions
- Keep diffs focused — one concern per change

---

## TEST

**When:** After the implementation is in place.

**What the AI should produce:**
- Test cases covering the happy path and the edge cases identified in PLAN
- Integration tests where they provide more value than unit tests
- Minimal mocks — prefer real dependencies where feasible

**Prompt (paste into any chat):**

> Generate tests for the current implementation.
>
> Cover: happy path, edge cases from the plan, and any error states.
> Prefer integration tests where practical. Use minimal mocks.

---

## REVIEW

**When:** When the implementation and tests are complete.

**What the AI should produce:**
- Bugs or logic errors
- Unhandled edge cases
- Security issues (injection, unvalidated input, exposed secrets)
- Duplicated logic that should be extracted
- Unnecessary complexity that should be simplified
- Performance issues that matter in production

**Prompt (paste into any chat):**

> Review this implementation as a senior engineer.
>
> Look for: bugs, edge cases, security issues, duplicated logic, unnecessary complexity.
> Be specific. Suggest fixes.

---

## VERIFY

**When:** Before marking the task as done.

**Checklist (run through this before finishing):**

- [ ] The code compiles / runs without errors
- [ ] Tests pass
- [ ] Edge cases from the PLAN phase are handled
- [ ] No duplicated logic was introduced
- [ ] The solution is as simple as it can be
- [ ] No sensitive data is exposed (secrets, tokens, PII)

**Prompt (paste into any chat):**

> Verify this implementation against the original plan.
>
> Check: compilation, tests, edge cases, simplicity, security.
> Flag anything that should be addressed before shipping.

---

## Quick reference

| Phase | Trigger | Output |
|-------|---------|--------|
| PLAN | Before any code | Implementation plan + edge cases |
| BUILD | Plan agreed | Minimal working implementation |
| TEST | Implementation done | Test suite covering plan + edge cases |
| REVIEW | Tests passing | List of issues with suggested fixes |
| VERIFY | Before done | Checklist sign-off |

---

## Adapters

Devflow keeps the workflow portable by separating the universal core from optional adapters.

Current adapter status:

| Harness | Integration |
|---------|-------------|
| Cursor | `/plan`, `/build`, `/tests`, `/review`, `/verify` slash commands |
| Claude | Documentation-only adapter. See `.devflow/adapters/claude/README.md` |
| Codex CLI | Documentation-only adapter. See `.devflow/adapters/codex/README.md` |
| Gemini CLI | Documentation-only adapter. See `.devflow/adapters/gemini/README.md` |
| Any other | Use `.devflow/README.md` and copy prompts from `devflow/prompts/` |
