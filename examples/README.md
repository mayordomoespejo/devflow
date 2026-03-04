# Devflow — Examples

Step-by-step demos for each supported tool. Each route creates a temporary project, runs `devflow init`, and verifies the installed files.

No frameworks or extra dependencies required — only Node.js 18+ and your AI tool of choice.

---

## Routes

| Route | Tool | What gets installed |
|-------|------|---------------------|
| [Cursor](#cursor) | Cursor IDE | core files + `.cursor/commands/` + `.cursor/rules/` |
| [Claude Code](#claude-code) | Claude Code CLI | core files + `.claude/commands/` + `.claude/rules/` |
| [Codex](#codex-cli) | OpenAI Codex CLI | core files + `.codex/INSTRUCTIONS.md` |
| [Gemini](#gemini-cli) | Google Gemini CLI | core files + `.gemini/INSTRUCTIONS.md` |

See [sample-project/README.md](sample-project/README.md) for the full walkthrough (create repo → install → verify → use).

---

## Cursor

```sh
mkdir /tmp/demo-cursor && cd /tmp/demo-cursor
git init
npx devflow init --adapter cursor
```

Expected files:

```
AGENTS.md
.cursor/
  commands/
    plan.md
    review.md
    tests.md
    verify.md
  rules/
    typescript.md
```

**Verify:**

```sh
ls AGENTS.md .cursor/commands/plan.md .cursor/rules/typescript.md
```

**Use:** Open the project in Cursor. Type `/plan` or `/review` in the chat panel — the commands are available immediately.

---

## Claude Code

```sh
mkdir /tmp/demo-claude && cd /tmp/demo-claude
git init
npx devflow init --adapter claude
```

Expected files:

```
AGENTS.md
.claude/
  commands/
    plan.md
    review.md
    tests.md
    verify.md
  rules/
    typescript.md
```

**Verify:**

```sh
ls AGENTS.md .claude/commands/plan.md .claude/rules/typescript.md
```

**Use:** Open the project with `claude` (Claude Code CLI). Type `/plan` or `/review` — the commands are picked up from `.claude/commands/`.

---

## Codex CLI

```sh
mkdir /tmp/demo-codex && cd /tmp/demo-codex
git init
npx devflow init --adapter codex
```

Expected files:

```
AGENTS.md
.codex/
  INSTRUCTIONS.md
```

**Verify:**

```sh
ls AGENTS.md .codex/INSTRUCTIONS.md
```

**Use:** Codex reads `AGENTS.md` at session start — no extra steps needed. The `.codex/INSTRUCTIONS.md` is a reference doc explaining what Codex supports and how to override instructions per project.

> To customise behaviour without editing the Devflow-managed file, create `AGENTS.override.md` at the project root.

---

## Gemini CLI

```sh
mkdir /tmp/demo-gemini && cd /tmp/demo-gemini
git init
npx devflow init --adapter gemini
```

Expected files:

```
AGENTS.md
.gemini/
  INSTRUCTIONS.md
```

**Verify:**

```sh
ls AGENTS.md .gemini/INSTRUCTIONS.md
```

**Use:** Gemini reads `GEMINI.md`, not `AGENTS.md`, at session start. Use `.gemini/INSTRUCTIONS.md` to map the Devflow core into a project `GEMINI.md`.

> To customise behaviour without editing the Devflow-managed file, create `AGENTS.override.md` at the project root.

---

## Installing multiple tools

```sh
mkdir /tmp/demo-all && cd /tmp/demo-all
git init

# Install everything at once
npx devflow init --adapter all

# Or layer adapters one by one (--merge skips existing files)
npx devflow init --adapter cursor
npx devflow init --adapter claude --merge
npx devflow init --adapter codex  --merge
npx devflow init --adapter gemini --merge
```

---

## Preview before installing

Use `--dry-run` to see what would be written without touching anything:

```sh
npx devflow init --adapter claude --dry-run
```
