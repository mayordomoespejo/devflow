# Claude Code Adapter

Devflow does not install a Claude Code adapter configuration in this step.

Reason:

- the portable source of truth lives in `templates/core/` and `templates/prompts/`
- this repository does not currently define a clear, verified Claude Code adapter contract to install automatically

Use Devflow with Claude Code by:

1. Installing the core files
2. Reading `AGENTS.md` from the project root
3. Reusing the prompts in `devflow/prompts/` manually

When the adapter format is verified, this directory can be upgraded from documentation to installable config.
