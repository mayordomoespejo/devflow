# Devflow Plugins

Plugins extend Devflow with additional workflow capabilities beyond the built-in adapters. Where adapters connect Devflow to AI tools (Cursor, Claude Code), plugins add new integrations and conventions: CI configuration, security audits, company-specific rules, and more.

---

## Installing a plugin

### From npm

```sh
npx devflow-agent-cli add devflow-plugin-github
npx devflow-agent-cli add devflow-plugin-ci
npx devflow-agent-cli add @myorg/devflow-plugin-rules
```

### From a local path

```sh
npx devflow-agent-cli add ./path/to/my-plugin
npx devflow-agent-cli add /absolute/path/to/plugin
```

### Flags

| Flag | Purpose |
|------|---------|
| `--force` | Reinstall even if the plugin is already present |
| `--dry-run` | Preview operations without writing any files |
| `--target <path>` | Install into a specific directory (monorepo support) |

---

## What installing does

1. Reads `devflow-plugin.json` from the plugin source
2. Copies the plugin's `templates/` directory into `destDir` (defaults to `.devflow/plugins/<name>/`)
3. Appends an entry to `.devflow/plugins.yml` in the target directory

`.devflow/plugins.yml` tracks which plugins are installed, their source, and their version. Commit this file alongside your other Devflow files.

---

## Removing a plugin

```sh
npx devflow-agent-cli remove <plugin-name>
npx devflow-agent-cli remove github
```

This removes the plugin's `destDir` from disk and removes its entry from `.devflow/plugins.yml`.

---

## Checking plugin health

`devflow doctor` reads `.devflow/plugins.yml` and reports the status of each installed plugin.

```sh
npx devflow-agent-cli doctor
npx devflow-agent-cli doctor --verbose
```

A plugin is `ok` when its key file exists on disk. A plugin is `missing` when the key file is gone — run `devflow add <source> --force` to reinstall.

---

## Updating a plugin

```sh
npx devflow-agent-cli add devflow-plugin-github --force
```

`--force` overwrites existing plugin files with the latest version from the source.

---

## Monorepo usage

Use `--target` to install a plugin into a specific package:

```sh
npx devflow-agent-cli add devflow-plugin-github --target packages/api
npx devflow-agent-cli remove github --target packages/api
```

---

## Git tracking

Plugin files are meant to be committed. Add the plugin directory and the tracking file:

```sh
git add .devflow/plugins/ .devflow/plugins.yml
git commit -m "chore: add devflow-plugin-github"
```

---

## Related

- [Plugin authoring guide](./plugin-authoring.md) — how to build a Devflow plugin
- [Monorepo guide](./monorepo.md) — using Devflow in a multi-package repo
