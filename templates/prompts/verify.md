# Devflow — Verify prompt

Use this prompt as a final check before shipping or opening a pull request.
Copy and paste it into any chat interface (ChatGPT, Claude, Gemini, terminal, etc.).

---

Verify this implementation against the original plan.

[Paste the code or describe what was implemented and what it was supposed to do]

Check each of the following and report the result:

1. Does the code compile or run without errors?
2. Do tests pass?
3. Are edge cases from the plan handled?
4. Is there any duplicated logic that was introduced?
5. Could the solution be simpler without losing correctness?
6. Is any sensitive data exposed (secrets, tokens, PII in logs)?

For each issue found, describe it clearly and suggest how to resolve it.
If everything looks good, confirm it is ready to ship.
