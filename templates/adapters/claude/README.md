# Claude Adapter

Devflow does not install a Claude-specific integration config in this step.

Reason:

- the universal source of truth already lives in `AGENTS.md`, `DEVFLOW.md`, `devflow/prompts/`, and `.devflow/workflows.yml`
- this repository does not currently define a verified Claude adapter contract to install automatically

Use Devflow with Claude tools by:

1. Installing the core files
2. Reusing the prompts in `devflow/prompts/` manually
3. Pointing the model to `AGENTS.md`, `DEVFLOW.md`, and `.devflow/workflows.yml` when you want repo-specific workflow guidance

When a stable Claude integration format is verified, this directory can be upgraded from documentation to installable config.
