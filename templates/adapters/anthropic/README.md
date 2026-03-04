# Anthropic Adapter

Devflow does not install an Anthropic-specific integration config in this step.

Reason:

- the universal source of truth already lives in `AGENTS.md`, `DEVFLOW.md`, `devflow/prompts/`, and `.devflow/workflows.yml`
- this repository does not currently define a verified Anthropic adapter contract to install automatically

Use Devflow with Anthropic tools by:

1. Installing the core files
2. Reusing the prompts in `devflow/prompts/` manually
3. Pointing the model to `AGENTS.md`, `DEVFLOW.md`, and `.devflow/workflows.yml` when you want repo-specific workflow guidance

If you are specifically using Claude, prefer the `claude` adapter. This `anthropic` adapter is the generic documentation path for Anthropic-hosted tools without a clear config contract.
