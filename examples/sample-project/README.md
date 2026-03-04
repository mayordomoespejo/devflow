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
  ✓  .devflow/workflows.yml
  ✓  devflow/prompts/plan.txt
  ✓  devflow/prompts/build.txt
  ✓  devflow/prompts/tests.txt
  ✓  devflow/prompts/review.txt
  ✓  devflow/prompts/verify.txt
  ✓  .cursor/commands/plan.md
  ✓  .cursor/commands/build.md
  ✓  .cursor/commands/review.md
  ✓  .cursor/commands/tests.md
  ✓  .cursor/commands/verify.md
  ✓  .cursor/rules/typescript.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md
ls devflow/prompts/
ls .cursor/commands/
ls .cursor/rules/
```

### 4. Use the workflow

Open the project in Cursor. In the AI chat panel:

- `/plan implement a user authentication module` — generates an ordered implementation plan before writing any code
- `/build` — implements the agreed plan with the minimum scope
- `/tests` — generates test cases for the current file or selection
- `/review` — reviews your latest changes as a senior engineer would
- `/verify` — runs a pre-finish checklist (edge cases, error handling, types)

TypeScript rules in `.cursor/rules/typescript.md` are applied automatically to every conversation.

---

## Claude

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
  ✓  .devflow/workflows.yml
  ✓  devflow/prompts/plan.txt
  ✓  devflow/prompts/build.txt
  ✓  devflow/prompts/tests.txt
  ✓  devflow/prompts/review.txt
  ✓  devflow/prompts/verify.txt
  ✓  .claude/commands/plan.md
  ✓  .claude/commands/build.md
  ✓  .claude/commands/tests.md
  ✓  .claude/commands/review.md
  ✓  .claude/commands/verify.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md
ls devflow/prompts/
ls .claude/commands/
```

### 4. Use the workflow

Open the project in Claude Code. In the AI chat panel:

- `/plan implement a user authentication module` — generates an ordered implementation plan before writing any code
- `/build` — implements the agreed plan with the minimum scope
- `/tests` — generates test cases for the current file or selection
- `/review` — reviews your latest changes as a senior engineer would
- `/verify` — runs a pre-finish checklist (edge cases, error handling, types)

See [docs/claude.md](../../docs/claude.md) for the full guide.

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
  ✓  .devflow/workflows.yml
  ✓  devflow/prompts/plan.txt
  ✓  devflow/prompts/build.txt
  ✓  devflow/prompts/tests.txt
  ✓  devflow/prompts/review.txt
  ✓  devflow/prompts/verify.txt
  ✓  .devflow/adapters/codex/README.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md
ls devflow/prompts/
ls .devflow/adapters/codex/
```

### 4. Use the workflow

Codex reads `AGENTS.md` at session start. All instructions from the file are active automatically — no slash commands or rules files are needed.

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
  ✓  .devflow/workflows.yml
  ✓  devflow/prompts/plan.txt
  ✓  devflow/prompts/build.txt
  ✓  devflow/prompts/tests.txt
  ✓  devflow/prompts/review.txt
  ✓  devflow/prompts/verify.txt
  ✓  .devflow/adapters/gemini/README.md

Done. Devflow installed successfully.
```

### 3. Verify

```sh
ls AGENTS.md DEVFLOW.md
ls devflow/prompts/
ls .devflow/adapters/gemini/
```

### 4. Use the workflow

Gemini reads `GEMINI.md`, not `AGENTS.md`, at session start. Create `GEMINI.md` to import the Devflow workflow:

```sh
cat > GEMINI.md << 'EOF'
@./AGENTS.md
EOF
```

See `.devflow/adapters/gemini/README.md` and `docs/gemini.md` for the full guide.

---

## All tools at once

### Install everything

```sh
mkdir ~/projects/demo-all
cd ~/projects/demo-all
git init
npx devflow init --adapters all
```

### Verify

```sh
ls AGENTS.md DEVFLOW.md
ls devflow/prompts/
ls .cursor/commands/ .cursor/rules/
ls .claude/commands/
ls .devflow/adapters/
```

### Commit the installed files

```sh
git add AGENTS.md DEVFLOW.md devflow/ .devflow/ .cursor/ .claude/
git commit -m "chore: add Devflow AI workflow files"
```

Every team member who clones the repo gets the same workflow files — no per-developer setup required.

---

## Updating an existing install

When Devflow releases new template versions, refresh with `--force`:

```sh
npx devflow init --adapters all --force
```

This overwrites all Devflow-managed files and leaves everything else untouched.
