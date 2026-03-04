#!/usr/bin/env node
/**
 * CI smoke test for the published Devflow contract.
 * Verifies:
 * - default install chooses core + generic in a temp directory
 * - explicit Cursor install adds the Cursor adapter
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

let passed = 0;
let failed = 0;

function run(args) {
  process.stdout.write(`\n[run]  devflow ${args}\n`);
  try {
    execSync(`node "${CLI}" ${args}`, { stdio: 'inherit' });
  } catch {
    failed++;
    console.error(`[FAIL] CLI error: devflow ${args}`);
    return false;
  }

  return true;
}

function check(file, label) {
  if (existsSync(file)) {
    passed++;
    console.log(`  PASS  ${label}`);
    return;
  }

  failed++;
  console.error(`  FAIL  ${label}`);
  console.error(`        missing: ${file}`);
}

const tmp = mkdtempSync(join(tmpdir(), 'devflow-ci-smoke-'));
const defaultTarget = join(tmp, 'default');
const cursorTarget = join(tmp, 'cursor');

mkdirSync(defaultTarget);
mkdirSync(cursorTarget);

try {
  console.log('Devflow CI smoke test');
  console.log(`Temp dir: ${tmp}`);

  run(`init --target "${defaultTarget}" --merge`);
  run(`init --adapter cursor --target "${cursorTarget}" --merge`);

  console.log('\n[check] default install');
  check(join(defaultTarget, 'AGENTS.md'), 'AGENTS.md');
  check(join(defaultTarget, 'DEVFLOW.md'), 'DEVFLOW.md');
  check(join(defaultTarget, 'devflow', 'prompts', 'plan.txt'), 'devflow/prompts/plan.txt');

  console.log('\n[check] cursor install');
  check(join(cursorTarget, 'AGENTS.md'), 'AGENTS.md');
  check(join(cursorTarget, 'DEVFLOW.md'), 'DEVFLOW.md');
  check(join(cursorTarget, 'devflow', 'prompts', 'plan.txt'), 'devflow/prompts/plan.txt');
  check(join(cursorTarget, '.cursor', 'commands', 'plan.md'), '.cursor/commands/plan.md');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
