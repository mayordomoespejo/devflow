#!/usr/bin/env node

import { execSync }                   from 'node:child_process';
import { mkdtempSync, mkdirSync,
         existsSync, rmSync }         from 'node:fs';
import { join, dirname }              from 'node:path';
import { tmpdir }                     from 'node:os';
import { fileURLToPath }              from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI       = join(__dirname, '..', 'dist', 'cli.js');

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

function checkMissing(file, label) {
  if (!existsSync(file)) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        unexpected file: ${file}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(Math.max(0, 50 - title.length))}`);
}

// ─── setup ───────────────────────────────────────────────────────────────────

const tmp = mkdtempSync(join(tmpdir(), 'devflow-smoke-'));
const targets = {};

for (const install of ['default-generic', 'default-cursor', 'default-claude', 'none', 'cursor', 'claude', 'codex', 'gemini', 'generic', 'multi']) {
  targets[install] = join(tmp, install);
  mkdirSync(targets[install]);
}

mkdirSync(join(targets['default-cursor'], '.cursor'));
mkdirSync(join(targets['default-claude'], '.claude'));

console.log(`Devflow smoke test`);
console.log(`Temp dir: ${tmp}`);

// ─── installs ────────────────────────────────────────────────────────────────

try {
  section('Installs');
  run('default-generic', `init                           --target "${targets['default-generic']}" --merge`);
  run('default-cursor',  `init                           --target "${targets['default-cursor']}"  --merge`);
  run('default-claude',  `init                           --target "${targets['default-claude']}"  --merge`);
  run('none',            `init --adapter none            --target "${targets.none}"               --merge`);
  run('cursor',          `init --adapter cursor          --target "${targets.cursor}"             --merge`);
  run('claude',          `init --adapter claude          --target "${targets.claude}"             --merge`);
  run('codex',           `init --adapter codex           --target "${targets.codex}"              --merge`);
  run('gemini',          `init --adapter gemini          --target "${targets.gemini}"             --merge`);
  run('generic',         `init --adapter generic         --target "${targets.generic}"            --merge`);
  run('multi',           `init --adapters cursor,generic --target "${targets.multi}"              --merge`);

  // ─── checks ────────────────────────────────────────────────────────────────

  // Core files present in every target
  for (const [tool, dir] of Object.entries(targets)) {
    section(`core files — ${tool} target`);
    check(join(dir, 'AGENTS.md'),                        'AGENTS.md');
    check(join(dir, 'DEVFLOW.md'),                       'DEVFLOW.md');
    check(join(dir, '.devflow', 'workflows.yml'),        '.devflow/workflows.yml');
    check(join(dir, 'devflow', 'prompts', 'plan.txt'),   'devflow/prompts/plan.txt');
    check(join(dir, 'devflow', 'prompts', 'build.txt'),  'devflow/prompts/build.txt');
    check(join(dir, 'devflow', 'prompts', 'tests.txt'),  'devflow/prompts/tests.txt');
    check(join(dir, 'devflow', 'prompts', 'review.txt'), 'devflow/prompts/review.txt');
    check(join(dir, 'devflow', 'prompts', 'verify.txt'), 'devflow/prompts/verify.txt');
  }

  section('default generic target');
  check(join(targets['default-generic'], '.devflow', 'README.md'), '.devflow/README.md');

  section('default cursor target');
  check(join(targets['default-cursor'], '.cursor', 'commands', 'plan.md'), '.cursor/commands/plan.md');

  section('default claude target');
  check(join(targets['default-claude'], '.claude', 'commands', 'plan.md'), '.claude/commands/plan.md');

  section('none target');
  checkMissing(join(targets.none, '.cursor', 'commands', 'plan.md'), '.cursor/commands/plan.md absent');
  checkMissing(join(targets.none, '.claude', 'commands', 'plan.md'), '.claude/commands/plan.md absent');
  checkMissing(join(targets.none, '.devflow', 'README.md'), '.devflow/README.md absent');

  section('cursor target');
  check(join(targets.cursor, '.cursor', 'commands', 'plan.md'),    '.cursor/commands/plan.md');
  check(join(targets.cursor, '.cursor', 'commands', 'build.md'),   '.cursor/commands/build.md');
  check(join(targets.cursor, '.cursor', 'commands', 'review.md'),  '.cursor/commands/review.md');
  check(join(targets.cursor, '.cursor', 'rules', 'typescript.md'), '.cursor/rules/typescript.md');

  section('claude target');
  check(join(targets.claude, '.claude', 'commands', 'plan.md'),   '.claude/commands/plan.md');
  check(join(targets.claude, '.claude', 'commands', 'build.md'),  '.claude/commands/build.md');
  check(join(targets.claude, '.claude', 'commands', 'tests.md'),  '.claude/commands/tests.md');
  check(join(targets.claude, '.claude', 'commands', 'review.md'), '.claude/commands/review.md');
  check(join(targets.claude, '.claude', 'commands', 'verify.md'), '.claude/commands/verify.md');

  section('codex target');
  check(join(targets.codex, '.devflow', 'adapters', 'codex', 'README.md'), '.devflow/adapters/codex/README.md');

  section('gemini target');
  check(join(targets.gemini, '.devflow', 'adapters', 'gemini', 'README.md'), '.devflow/adapters/gemini/README.md');

  section('generic target');
  check(join(targets.generic, '.devflow', 'README.md'), '.devflow/README.md');

  section('multi target');
  check(join(targets.multi, '.cursor', 'commands', 'plan.md'), '.cursor/commands/plan.md');
  check(join(targets.multi, '.devflow', 'README.md'), '.devflow/README.md');

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
