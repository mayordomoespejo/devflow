# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-04

### Added

- Initial public release of Devflow `0.1.0`
- Universal core install with `AGENTS.md`, `DEVFLOW.md`, and `devflow/prompts/`
- `devflow init` CLI with `--target`, `--force`, `--merge`, `--dry-run`, `--adapter`, and `--adapters`
- Default adapter detection: `cursor` when `.cursor/` exists, otherwise `generic`
- Cursor adapter with `.cursor/commands/` and `.cursor/rules/typescript.md`
- Documentation adapters for `generic`, `claude`, `codex`, and `gemini`
- Template validation and smoke tests
- GitHub Actions CI for Node 18 and 20
- Universal README, usage guides, and examples

[Unreleased]: https://github.com/mayordomoespejo/devflow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/mayordomoespejo/devflow/releases/tag/v0.1.0
