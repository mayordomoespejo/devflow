# Sample project walkthrough

A concrete end-to-end demo: create a minimal repo, install Devflow for one or more tools, verify the files, and try the workflow.

Pick the tool you use and follow that section. All sections share the same shape:

1. Create a dummy repo
2. Run `npx devflow init --adapter <tool>`
3. Verify the installed files
4. Try the workflow

---

## Cursor

### 1. Create a dummy repo

```sh
mkdir ~/projects/demo-cursor
cd ~/projects/demo-cursor
git init
echo "# Demo" > README.md
```

### 2. Install

```sh
npx devflow init --adapter cursor
```

Output:

```
Devflow: installing into /home/you/projects/demo-cursor

  ✓  AGENTS.md
  ✓  DEVFLOW.md
  ✓  devflow/prompts/plan.md
  ✓  devflow/prompts/review.md
  ✓  devflow/prompts/tests.md
  ✓  devflow/prompts/verify.md
  ✓  .cursor/commands/plan.md
  ✓  .cursor/commands/review.md
  ✓  .cursor/commands/tests.md
  ✓  .cursor/commands/verify.md
  ✓  .cursor/rules/typescript.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md
ls DEVFLOW.md
ls devflow/prompts/
ls .cursor/commands/
ls .cursor/rules/
```

Expected:

```
AGENTS.md
DEVFLOW.md
devflow/prompts/  plan.md  review.md  tests.md  verify.md
.cursor/commands/  plan.md  review.md  tests.md  verify.md
.cursor/rules/     typescript.md
```

### 4. Use the workflow

Open the project in Cursor. In the AI chat panel:

- `/plan implement a user authentication module` — generates an ordered implementation plan before writing any code
- `/review` — reviews your latest changes as a senior engineer would
- `/tests` — generates test cases for the current file or selection
- `/verify` — runs a pre-finish checklist (edge cases, error handling, types)

TypeScript rules in `.cursor/rules/typescript.md` are applied automatically to every conversation.

---

## Claude Code

### 1. Create a dummy repo

```sh
mkdir ~/projects/demo-claude
cd ~/projects/demo-claude
git init
echo "# Demo" > README.md
```

### 2. Install

```sh
npx devflow init --adapter claude
```

Output:

```
Devflow: installing into /home/you/projects/demo-claude

  ✓  AGENTS.md
  ✓  DEVFLOW.md
  ✓  devflow/prompts/plan.md
  ✓  devflow/prompts/review.md
  ✓  devflow/prompts/tests.md
  ✓  devflow/prompts/verify.md
  ✓  .claude/commands/plan.md
  ✓  .claude/commands/review.md
  ✓  .claude/commands/tests.md
  ✓  .claude/commands/verify.md
  ✓  .claude/rules/typescript.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md
ls DEVFLOW.md
ls devflow/prompts/
ls .claude/commands/
ls .claude/rules/
```

Expected:

```
AGENTS.md
DEVFLOW.md
devflow/prompts/  plan.md  review.md  tests.md  verify.md
.claude/commands/  plan.md  review.md  tests.md  verify.md
.claude/rules/     typescript.md
```

### 4. Use the workflow

Open the project with the `claude` CLI (Claude Code). In the chat:

- `/plan implement a paginated API endpoint` — Claude reads the command from `.claude/commands/plan.md` and produces a step-by-step plan
- `/review` — senior engineer review of staged or current changes
- `/tests` — generate test cases for the selected code
- `/verify` — pre-finish verification checklist

TypeScript rules in `.claude/rules/typescript.md` are loaded automatically.

---

## Codex CLI

### 1. Create a dummy repo

```sh
mkdir ~/projects/demo-codex
cd ~/projects/demo-codex
git init
echo "# Demo" > README.md
```

### 2. Install

```sh
npx devflow init --adapter codex
```

Output:

```
Devflow: installing into /home/you/projects/demo-codex

  ✓  AGENTS.md
  ✓  DEVFLOW.md
  ✓  devflow/prompts/plan.md
  ✓  devflow/prompts/review.md
  ✓  devflow/prompts/tests.md
  ✓  devflow/prompts/verify.md
  ✓  .codex/INSTRUCTIONS.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md .codex/INSTRUCTIONS.md
ls devflow/prompts/
```

### 4. Use the workflow

Codex reads `AGENTS.md` at session start. All instructions from the file are active automatically — no slash commands or rules files are needed.

The `.codex/INSTRUCTIONS.md` file explains:
- how Codex loads instruction files hierarchically
- what features it does and does not support
- how to override instructions per project

**Override pattern** — to customise without editing the Devflow-managed file:

```sh
cat > AGENTS.override.md << 'EOF'
# My project overrides

Use pnpm instead of npm.
Prefer Zod for input validation.
EOF
```

Codex gives `AGENTS.override.md` precedence over `AGENTS.md`.

---

## Gemini CLI

### 1. Create a dummy repo

```sh
mkdir ~/projects/demo-gemini
cd ~/projects/demo-gemini
git init
echo "# Demo" > README.md
```

### 2. Install

```sh
npx devflow init --adapter gemini
```

Output:

```
Devflow: installing into /home/you/projects/demo-gemini

  ✓  AGENTS.md
  ✓  DEVFLOW.md
  ✓  devflow/prompts/plan.md
  ✓  devflow/prompts/review.md
  ✓  devflow/prompts/tests.md
  ✓  devflow/prompts/verify.md
  ✓  .gemini/INSTRUCTIONS.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md .gemini/INSTRUCTIONS.md
ls devflow/prompts/
```

### 4. Use the workflow

Gemini reads `GEMINI.md`, not `AGENTS.md`, at session start. Use `.gemini/INSTRUCTIONS.md` to create a project `GEMINI.md` that imports the Devflow core.

The `.gemini/INSTRUCTIONS.md` file explains:
- how Gemini loads instruction files
- what features it does and does not support
- how to override instructions per project

**Override pattern** — to customise without editing the Devflow-managed file:

```sh
cat > AGENTS.override.md << 'EOF'
# My project overrides

Use pnpm instead of npm.
Prefer Zod for input validation.
EOF
```

---

## All tools at once

### Install everything

```sh
mkdir ~/projects/demo-all
cd ~/projects/demo-all
git init
npx devflow init --adapter all
```

### Verify

```sh
ls AGENTS.md
ls DEVFLOW.md
ls devflow/prompts/
ls .cursor/commands/ .cursor/rules/
ls .claude/commands/ .claude/rules/
ls .codex/
ls .gemini/
```

### Commit the installed files

```sh
git add AGENTS.md DEVFLOW.md devflow/ .cursor .claude .codex .gemini
git commit -m "chore: add Devflow AI workflow files"
```

Every team member who clones the repo gets the same workflow files — no per-developer setup required.

---

## Updating an existing install

When Devflow releases new template versions, refresh with `--force`:

```sh
npx devflow init --adapter all --force
```

This overwrites all Devflow-managed files (`AGENTS.md`, `.cursor`, `.claude`, `.codex`, `.gemini`) and leaves everything else untouched.
