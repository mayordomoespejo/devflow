# Devflow In A Monorepo

This guide explains how to use Devflow in a repository that contains multiple packages.

## How `--target` works

Every Devflow command accepts a `--target <path>` flag that points to the directory where files are installed or inspected. This is the mechanism for monorepo support — Devflow is not monorepo-aware by default, but `--target` lets you scope any operation to any subtree.

---

## Common patterns

### Pattern 1: Root-only install

Install Devflow once at the repository root. All packages share the same core workflow files and prompts.

```sh
# From the repo root
npx devflow init --adapter cursor
```

All packages inherit `AGENTS.md`, `DEVFLOW.md`, `devflow/prompts/`, and the adapter files at the root. This is the simplest setup and works well when every package follows the same engineering standards.

---

### Pattern 2: Per-package install

Install Devflow separately in each package. Useful when packages use different AI tools or have different workflow expectations.

```sh
# API package uses Claude Code
npx devflow init --adapter claude --target packages/api

# Frontend package uses Cursor
npx devflow init --adapter cursor --target packages/frontend

# Shared library uses no adapter-specific files
npx devflow init --adapter none --target packages/shared
```

Each package gets its own `AGENTS.md`, `DEVFLOW.md`, and adapter files. The files are independent — updating one package does not affect others.

---

### Pattern 3: All packages at once

Use a shell loop to install Devflow in every package with the same adapter.

```sh
for pkg in packages/*; do
  npx devflow init --adapter generic --target "$pkg" --merge
done
```

Use `--merge` to skip packages that already have Devflow installed.

---

### Pattern 4: Root core + per-package adapters

Install the core at the root (shared prompts and workflow contract) and install adapter-specific files only in packages that need them.

```sh
# Core at root (adapter none = core only)
npx devflow init --adapter none

# Cursor adapter only in the frontend package
npx devflow init --adapter cursor --target packages/frontend

# Claude Code adapter only in the API package
npx devflow init --adapter claude --target packages/api
```

---

## Checking health per package

Use `devflow doctor` with `--target` to inspect a specific package:

```sh
npx devflow doctor --target packages/api
npx devflow doctor --target packages/frontend --verbose
```

To check all packages at once:

```sh
for pkg in packages/*; do
  echo "── $pkg"
  npx devflow doctor --target "$pkg"
done
```

---

## Git tracking

Devflow files are meant to be committed to the repository so every team member gets the same workflow.

### Root install

```sh
git add AGENTS.md DEVFLOW.md devflow/ .devflow/ .cursor/ .claude/
git commit -m "chore: add Devflow workflow files"
```

### Per-package install

```sh
git add \
  packages/api/.claude/ \
  packages/api/AGENTS.md \
  packages/api/DEVFLOW.md \
  packages/api/devflow/ \
  packages/api/.devflow/ \
  packages/frontend/.cursor/ \
  packages/frontend/AGENTS.md \
  packages/frontend/DEVFLOW.md \
  packages/frontend/devflow/ \
  packages/frontend/.devflow/
git commit -m "chore: add Devflow workflow files per package"
```

---

## Updating

To refresh Devflow-managed files across all packages after a new release:

```sh
# Root
npx devflow init --force

# All packages
for pkg in packages/*; do
  npx devflow init --target "$pkg" --force
done
```

`--force` only overwrites files under Devflow-managed paths (`.devflow/`, `.cursor/`, `.claude/`, `devflow/`, `AGENTS.md`, `DEVFLOW.md`). Your application code is never touched.

---

## Recommended setup

For most monorepos:

1. Install the core once at the root with `--adapter none`
2. Install the adapter for each package based on the AI tool the team uses there
3. Commit all files
4. Run `devflow doctor --target <package>` in CI to detect drift
