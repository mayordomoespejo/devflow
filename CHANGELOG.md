# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-03-04

### Added

- `devflow init` CLI command with `--tool`, `--target`, `--force`, `--merge`, `--dry-run` flags
- Multi-tool support: Cursor, Claude Code, Codex CLI, Gemini CLI
- Template structure:
  - `templates/common/AGENTS.md` — universal engineering principles, installed for every tool
  - `templates/cursor/.cursor/commands/` — `/plan`, `/review`, `/tests`, `/verify` slash commands
  - `templates/cursor/.cursor/rules/typescript.md` — always-on TypeScript rules
  - `templates/claude/.claude/commands/` — `/plan`, `/review`, `/tests`, `/verify` slash commands
  - `templates/claude/.claude/rules/typescript.md` — always-on TypeScript rules
  - `templates/codex/INSTRUCTIONS.md` — reference doc installed to `.codex/`
  - `templates/gemini/INSTRUCTIONS.md` — reference doc installed to `.gemini/`
- `MANAGED_PREFIXES` safety: `--force` only overwrites `AGENTS.md`, `.cursor`, `.claude`, `.codex`, `.gemini`
- `scripts/validate-templates.mjs` — fails with exit 1 if any required template file is missing
- `scripts/smoke-test.mjs` — integration tests covering all five install targets
- GitHub Actions CI: Node 18 and 20 matrix, runs validate + smoke tests on push and PR
- `package.json` `files` field for clean npm publish
- Per-tool documentation in `docs/`
- Demo walkthrough in `examples/`

[Unreleased]: https://github.com/mayordomoespejo/devflow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mayordomoespejo/devflow/releases/tag/v0.1.0
