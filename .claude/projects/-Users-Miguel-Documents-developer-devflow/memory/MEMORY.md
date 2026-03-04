# Devflow — Project Memory

## Supported tools (FOUR, not three)

Devflow supports **cursor, claude, codex, and gemini**. Gemini is always included.
Declared in `TOOL_CONFIG` in [src/cli.js](src/cli.js).

| Tool   | Template dir         | destDir  | Key file                  |
|--------|----------------------|----------|---------------------------|
| cursor | templates/cursor/    | (root)   | .cursor/commands/plan.md  |
| claude | templates/claude/    | (root)   | .claude/commands/plan.md  |
| codex  | templates/codex/     | .codex/  | .codex/README.md          |
| gemini | templates/gemini/    | (root)   | GEMINI.md                 |

`templates/common/AGENTS.md` is always installed regardless of `--tool`.

## CLI flags

```
devflow init [options]
  --tool cursor|claude|codex|gemini|all  default: all
  -m, --merge     skip existing files (add tools incrementally)
  -f, --force     overwrite existing files (wins over --merge)
  -n, --dry-run   preview [create]/[overwrite]/[skip]/[conflict] per file
  -t, --target    install into a different directory
```

## Key architecture

- `buildInstallList(tools)` → `[{ src, dest }]` — collects from common/ + each tool's srcDir, maps to target with destDir prefix
- `validate(tools, targetDir)` — checks `AGENTS.md` + each tool's `keyFile`
- codex is the only tool with a non-empty `destDir` (`.codex`)

## Project structure

```
templates/
  common/AGENTS.md
  cursor/.cursor/commands/*.md + rules/typescript.md
  claude/CLAUDE.md + .claude/commands/*.md
  codex/README.md  (installs to .codex/README.md)
  gemini/GEMINI.md
src/cli.js
docs/cursor.md, claude-code.md, codex.md, gemini.md
```
