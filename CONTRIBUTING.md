# Contributing

Thanks for contributing to Devflow.

Devflow is a small CLI with a strict product boundary:

- `templates/` is the source of truth
- the universal core comes first
- adapters are optional and should only exist when the integration contract is clear

## Before You Change Anything

Use this order:

1. Understand the problem
2. Identify the affected files
3. Propose the smallest useful change
4. Update tests or validation if behavior changes
5. Verify the result locally

## Project Structure

```txt
src/cli.js
templates/
  core/
  prompts/
  adapters/
scripts/
docs/
examples/
.github/workflows/
```

Key rule:

- if installation behavior changes, update `templates/`, validation, smoke tests, and docs together

## Local Setup

Requirements:

- Node.js 18+
- npm

Install dependencies:

```sh
npm ci
```

Run checks:

```sh
npm run validate
npm run test:ci-smoke
npm test
```

## Contribution Guidelines

- Prefer modifying existing code over adding abstractions
- Keep the CLI behavior explicit and predictable
- Do not invent integrations for tools unless the format is well-defined
- Treat documentation adapters as documentation, not as fake config
- Keep docs aligned with the actual installed output

## Changing Templates

If you add or rename installed files:

1. Update the relevant files under `templates/`
2. Update `scripts/validate-templates.mjs` if required template files change
3. Update smoke tests if install output changes
4. Update docs and examples

## Changing CLI Behavior

If you change `devflow init`:

1. Update `src/cli.js`
2. Update smoke tests
3. Update `README.md` and any affected guide in `docs/`
4. Update `CHANGELOG.md`

## Pull Requests

- Keep changes focused
- Prefer one concern per PR
- Make sure the relevant checks pass locally
- Document user-visible changes in `CHANGELOG.md` under `Unreleased`

## Commit Style

Prefer conventional-style commit messages, for example:

```text
feat(cli): add adapter autodetection
docs: rewrite anywhere guide
ci: add smoke tests for core + adapters
chore: add changelog and community docs
```
