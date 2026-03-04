# Devflow Plugin Authoring Guide

A Devflow plugin is a directory that contains a manifest file and a `templates/` subdirectory. When installed, the templates are copied into the target project and the plugin is tracked in `.devflow/plugins.yml`.

---

## Directory layout

```
my-plugin/
├── devflow-plugin.json   ← required manifest
└── templates/            ← required; contents are copied on install
    └── .devflow/
        └── plugins/
            └── my-plugin/
                └── README.md   ← conventional key file
```

The `templates/` directory mirrors the layout of the files as they will appear in the target project. Everything under `templates/` is copied verbatim, preserving relative paths.

---

## Manifest: `devflow-plugin.json`

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin adds to the workflow",
  "destDir": ".devflow/plugins/my-plugin",
  "keyFile": ".devflow/plugins/my-plugin/README.md"
}
```

### Fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | yes | — | Unique identifier. Used as the plugin name in `devflow remove <name>` and in `plugins.yml`. Use lowercase, hyphens only. |
| `version` | yes | — | Semver string. Recorded in `plugins.yml`. |
| `description` | no | — | Human-readable summary shown in logs. |
| `destDir` | no | `.devflow/plugins/<name>` | Where the plugin's files are installed, relative to the target directory. |
| `keyFile` | no | `<destDir>/README.md` | The file `devflow doctor` checks to determine if the plugin is healthy. |

### Rules

- `name` must be a non-empty string with no spaces.
- `version` must be a non-empty string. Semver is conventional but not enforced.
- `destDir` and `keyFile` are relative to the target project root, not to `templates/`.
- The `keyFile` must exist after installation. If it does not, `devflow doctor` will report `missing`.

---

## Templates

Place every file the plugin installs under `templates/`. The path inside `templates/` determines where the file lands in the target project.

**Example:**

```
templates/
└── .devflow/
    └── plugins/
        └── github/
            ├── README.md
            └── pr-review.md
```

After `devflow add ./my-plugin`, the target project will contain:

```
.devflow/
└── plugins/
    └── github/
        ├── README.md
        └── pr-review.md
```

---

## Packaging as an npm package

To distribute a plugin via npm, structure the package so that `devflow-plugin.json` and `templates/` are at the package root:

```
my-npm-package/
├── package.json
├── devflow-plugin.json
└── templates/
    └── ...
```

`package.json` for the plugin:

```json
{
  "name": "devflow-plugin-github",
  "version": "1.0.0",
  "description": "GitHub PR review integration for Devflow",
  "keywords": ["devflow", "devflow-plugin"],
  "files": ["devflow-plugin.json", "templates"]
}
```

Install with:

```sh
npx devflow-cli add devflow-plugin-github
```

---

## Naming convention

Published plugins should use the prefix `devflow-plugin-`:

```
devflow-plugin-github
devflow-plugin-ci
devflow-plugin-security
@myorg/devflow-plugin-rules
```

---

## Testing a plugin locally

```sh
# Build your plugin
mkdir -p my-plugin/templates/.devflow/plugins/my-plugin
echo '{"name":"my-plugin","version":"1.0.0"}' > my-plugin/devflow-plugin.json
echo "# My plugin" > my-plugin/templates/.devflow/plugins/my-plugin/README.md

# Create a test project
mkdir /tmp/test-project
npx devflow-cli init --target /tmp/test-project --merge

# Install the plugin
npx devflow-cli add ./my-plugin --target /tmp/test-project

# Verify
cat /tmp/test-project/.devflow/plugins.yml
npx devflow-cli doctor --target /tmp/test-project

# Remove the plugin
npx devflow-cli remove my-plugin --target /tmp/test-project
```

---

## What `devflow doctor` checks

`devflow doctor` reads `.devflow/plugins.yml` and checks that each plugin's `keyFile` exists on disk. If it does, the plugin status is `ok`. If not, it is `missing` and an issue is reported.

The `keyFile` should be a file that only exists when the plugin is properly installed — the plugin's own `README.md` is the conventional choice.

---

## Related

- [Plugin user guide](./plugins.md) — installing and removing plugins
- [Monorepo guide](./monorepo.md) — per-package plugin installs
