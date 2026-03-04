# Devflow — Tests prompt

Use this prompt to generate a test suite after implementing a feature.
Copy and paste it into any chat interface (ChatGPT, Claude, Gemini, terminal, etc.).

---

Generate tests for the following implementation:

[Paste the code or describe what was implemented]

Cover:

- The happy path
- Edge cases identified during planning
- Error states and invalid input
- Any boundary conditions

Prefer:

- Integration tests over unit tests where they provide more confidence
- Realistic test data over artificial fixtures
- Minimal mocking — use real dependencies where feasible

Provide the test code ready to run.
