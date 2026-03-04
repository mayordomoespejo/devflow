# Contributing to Devflow

Thank you for considering a contribution. This document covers the basics to get you started.

---

## What to contribute

- **Bug reports** — unexpected CLI behaviour, wrong files installed, broken flags
- **Template improvements** — better instructions, more useful slash commands, rule refinements
- **New tool support** — adding a new AI tool target (new template dir + CLI config + docs)
- **Documentation** — corrections, clearer explanations, additional examples

If you are unsure whether an idea fits the project, open an issue before writing code.

---

## Project structure

```
src/cli.js                 # CLI entry point (Node.js, CJS)
templates/
  common/AGENTS.md         # installed for every tool
  cursor/.cursor/          # Cursor commands and rules
  claude/.claude/          # Claude Code commands and rules
  codex/INSTRUCTIONS.md    # reference doc → .codex/
  gemini/INSTRUCTIONS.md   # reference doc → .gemini/
scripts/
  validate-templates.mjs   # fails if any required template is missing
  smoke-test.mjs           # integration tests (install + verify)
docs/                      # per-tool setup guides
examples/                  # demo walkthroughs
.github/workflows/ci.yml   # GitHub Actions: Node 18 + 20 matrix
```

---

## Development setup

Requirements: Node.js 18+, npm.

```sh
git clone https://github.com/mayordomoespejo/devflow.git
cd devflow
npm install
```

Run the full test suite:

```sh
npm test
```

This runs template validation followed by the CLI smoke tests against temporary directories. No network access required.

---

## Adding or changing templates

1. Edit files under `templates/`.
2. If you add a new required file, add it to the `REQUIRED` array in `scripts/validate-templates.mjs`.
3. If the new file changes the install output, add the corresponding `check()` call to `scripts/smoke-test.mjs`.
4. Run `npm test` — all checks must pass before opening a PR.

---

## Adding a new tool target

1. Create `templates/<tool>/` with the appropriate files.
2. Add a `TOOL_CONFIG` entry in `src/cli.js`:
   ```js
   newtool: {
     srcDir:  'newtool',
     destDir: '.newtool',   // or '' for target root
     keyFile: path.join('.newtool', 'INSTRUCTIONS.md'),
   },
   ```
3. Add required files to `scripts/validate-templates.mjs`.
4. Add smoke-test checks for the new target in `scripts/smoke-test.mjs`.
5. Create `docs/newtool.md` following the pattern of the existing tool docs.
6. Link the new doc from `README.md`.
7. Run `npm test`.

---

## Commit style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(cli): add --reset flag
fix(templates): correct claude rule path
docs: update gemini setup guide
chore: bump version to 0.2.0
```

---

## Pull requests

- Keep PRs focused — one concern per PR.
- `npm test` must pass.
- Update `CHANGELOG.md` under `[Unreleased]` describing what changed.
- Link the relevant issue if one exists.

---

## Reporting bugs

Open an issue at <https://github.com/mayordomoespejo/devflow/issues> with:

- Node.js version (`node --version`)
- Operating system
- The exact command you ran
- Expected vs actual output
