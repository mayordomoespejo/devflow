# Devflow — Review prompt

Use this prompt after implementing a feature or fix, before marking it done.
Copy and paste it into any chat interface (ChatGPT, Claude, Gemini, terminal, etc.).

---

Review the following implementation as a senior engineer.

[Paste the code or describe what was implemented]

Check for:

- Bugs and logic errors
- Unhandled edge cases
- Security issues (injection, unvalidated input, exposed secrets)
- Duplicated logic that should be extracted
- Unnecessary complexity that should be simplified
- Performance issues that matter in production

Be specific. For each issue found, describe the problem and suggest a fix.
