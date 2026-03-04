# Generic Adapter

Use this adapter when your tool does not support native commands or rules.

How to use Devflow in any chat or IDE:

1. Start from `AGENTS.md` for the default engineering behavior
2. Use `devflow/prompts/plan.txt` before writing code
3. Use `devflow/prompts/build.txt` while implementing
4. Use `devflow/prompts/tests.txt` after implementation
5. Use `devflow/prompts/review.txt` for code review
6. Use `devflow/prompts/verify.txt` before shipping

This keeps the workflow portable without relying on tool-specific config.
