# Devflow Tests

Generate tests for the current implementation.

If the user provided inline command text, treat it as extra scope. Otherwise use the current conversation context and repository state.

Cover:

- The happy path
- Edge cases from planning
- Error states and invalid input
- Boundary conditions

Prefer higher-value tests with minimal mocking.
