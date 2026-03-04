#!/usr/bin/env node
/**
 * Smoke test for devflow CLI.
 * Creates isolated temp directories, runs installs per tool, checks expected files.
 * Exit code 0 = all pass, 1 = any failure.
 */

import { execSync }                   from 'node:child_process';
import { mkdtempSync, mkdirSync,
         existsSync, rmSync }         from 'node:fs';
import { join, dirname }              from 'node:path';
import { tmpdir }                     from 'node:os';
import { fileURLToPath }              from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI       = join(__dirname, '..', 'src', 'cli.js');

// ─── helpers ─────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function run(label, args) {
  process.stdout.write(`\n[run]  devflow ${args}\n`);
  try {
    execSync(`node "${CLI}" ${args}`, { stdio: 'inherit' });
  } catch {
    console.error(`[FAIL] CLI error: devflow ${args}`);
    failed++;
    return false;
  }
  return true;
}

function check(file, label) {
  if (existsSync(file)) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        missing: ${file}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`);
}

// ─── setup ───────────────────────────────────────────────────────────────────

const tmp = mkdtempSync(join(tmpdir(), 'devflow-smoke-'));
const targets = {};

for (const tool of ['cursor', 'claude', 'codex', 'gemini', 'all']) {
  targets[tool] = join(tmp, tool);
  mkdirSync(targets[tool]);
}

console.log(`Devflow smoke test`);
console.log(`Temp dir: ${tmp}`);

// ─── installs ────────────────────────────────────────────────────────────────

try {
  section('Installs');
  run('cursor', `init --tool cursor --target "${targets.cursor}" --merge`);
  run('claude', `init --tool claude --target "${targets.claude}" --merge`);
  run('codex',  `init --tool codex  --target "${targets.codex}"  --merge`);
  run('gemini', `init --tool gemini --target "${targets.gemini}" --merge`);
  run('all',    `init --tool all    --target "${targets.all}"    --merge`);

  // ─── checks ────────────────────────────────────────────────────────────────

  section('cursor target');
  check(join(targets.cursor, 'AGENTS.md'),                     'AGENTS.md');
  check(join(targets.cursor, '.cursor', 'commands', 'plan.md'), '.cursor/commands/plan.md');
  check(join(targets.cursor, '.cursor', 'commands', 'review.md'), '.cursor/commands/review.md');
  check(join(targets.cursor, '.cursor', 'rules', 'typescript.md'), '.cursor/rules/typescript.md');

  section('claude target');
  check(join(targets.claude, 'AGENTS.md'),                          'AGENTS.md');
  check(join(targets.claude, '.claude', 'commands', 'plan.md'),     '.claude/commands/plan.md');
  check(join(targets.claude, '.claude', 'commands', 'review.md'),   '.claude/commands/review.md');
  check(join(targets.claude, '.claude', 'rules', 'typescript.md'),  '.claude/rules/typescript.md');

  section('codex target');
  check(join(targets.codex, 'AGENTS.md'),                'AGENTS.md');
  check(join(targets.codex, '.codex', 'INSTRUCTIONS.md'), '.codex/INSTRUCTIONS.md');

  section('gemini target');
  check(join(targets.gemini, 'AGENTS.md'),                  'AGENTS.md');
  check(join(targets.gemini, '.gemini', 'INSTRUCTIONS.md'), '.gemini/INSTRUCTIONS.md');

  section('all target');
  check(join(targets.all, 'AGENTS.md'),                                 'AGENTS.md');
  check(join(targets.all, '.cursor', 'commands', 'plan.md'),            '.cursor/commands/plan.md');
  check(join(targets.all, '.claude', 'commands', 'plan.md'),            '.claude/commands/plan.md');
  check(join(targets.all, '.claude', 'rules', 'typescript.md'),         '.claude/rules/typescript.md');
  check(join(targets.all, '.codex', 'INSTRUCTIONS.md'),                 '.codex/INSTRUCTIONS.md');
  check(join(targets.all, '.gemini', 'INSTRUCTIONS.md'),                '.gemini/INSTRUCTIONS.md');

} finally {
  rmSync(tmp, { recursive: true, force: true });
}

// ─── summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(53)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.error('Smoke test FAILED.');
  process.exit(1);
} else {
  console.log('Smoke test passed.');
}
