# Codex Adapter

Devflow does not install a Codex-specific adapter configuration in this step.

Reason:

- the core workflow already lives in `AGENTS.md`, `DEVFLOW.md`, and `devflow/prompts/`
- this step avoids inventing extra Codex integration files without a clear contract

Use Devflow with Codex by:

1. Installing the core files
2. Running Codex from the project root so it can read `AGENTS.md`
3. Reusing the prompts in `devflow/prompts/` when you want explicit PLAN, BUILD, TEST, REVIEW, or VERIFY phases
