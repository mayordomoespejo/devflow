# Devflow — Generic setup (no harness integration)

Use this guide if you work with AI in a plain chat interface — ChatGPT, Claude.ai, Gemini.ai, a terminal session, or any tool not natively supported by Devflow.

No special configuration is required. The workflow lives in two files installed by Devflow:

- **`AGENTS.md`** — paste this at the start of a session to set the AI's behaviour
- **`DEVFLOW.md`** — the full five-phase workflow reference
- **`devflow/prompts/`** — four ready-to-paste prompts, one per phase

---

## Quick setup

### 1. Start a session

Paste the contents of `AGENTS.md` at the beginning of your chat. This sets the AI's role and principles for the conversation.

### 2. Begin with PLAN

Before writing any code, paste `devflow/prompts/plan.md` into the chat. Fill in the bracketed section with your task description.

```
Create a step-by-step implementation plan for the following task:

[your task here]
...
```

### 3. Implement (BUILD phase)

Once the plan looks right, ask the AI to implement it. Reference the plan in your message:

```
Implement step 1 from the plan above. Keep it minimal.
```

### 4. Generate tests

Paste `devflow/prompts/tests.md` after the implementation is in place.

### 5. Review

Paste `devflow/prompts/review.md`. The AI will audit the implementation for bugs, edge cases, and complexity.

### 6. Verify before shipping

Paste `devflow/prompts/verify.md` as a final check. Address any issues it surfaces before opening a PR.

---

## Tips for plain-chat sessions

**Context window:** Paste only the relevant files or excerpts, not the entire codebase. Describe the broader context in words.

**Keep sessions focused:** One task per session. Start fresh for each new feature or bug fix — stale context causes drift.

**Save the plan:** Copy the AI's plan into a comment, a scratch file, or a GitHub issue. You will need to refer to it during BUILD and VERIFY.

**Model choice:** The Devflow workflow works with any model. Claude, GPT-4, Gemini, Mistral — the prompts are model-agnostic.

---

## What you do not get (vs native adapters)

| Feature | Cursor / Claude Code | Generic |
|---------|---------------------|---------|
| Slash commands (`/plan`, `/review`) | ✓ | — |
| Rules auto-applied to every message | ✓ | — |
| IDE integration | ✓ | — |
| Works in any chat UI | — | ✓ |
| Works with any model | — | ✓ |

If you later adopt Cursor or Claude Code, run `npx devflow init --tool cursor` or `--tool claude` to add the native integration on top.
