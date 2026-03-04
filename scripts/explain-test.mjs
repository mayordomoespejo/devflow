#!/usr/bin/env node
/**
 * Smoke test for devflow explain.
 * Verifies:
 * - empty directory reports missing core and recommends init
 * - initialized directory reports healthy core and available workflows
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI = join(__dirname, '..', 'src', 'cli.js');

let passed = 0;
let failed = 0;

function runJson(args) {
  return JSON.parse(execFileSync('node', [CLI, 'explain', '--json', ...args], { encoding: 'utf8' }));
}

function run(args) {
  execFileSync('node', [CLI, ...args], { stdio: 'inherit' });
}

function check(condition, label, details = '') {
  if (condition) {
    passed++;
    console.log(`  PASS  ${label}`);
    return;
  }

  failed++;
  console.error(`  FAIL  ${label}`);
  if (details) {
    console.error(`        ${details}`);
  }
}

const tmp = mkdtempSync(join(tmpdir(), 'devflow-explain-'));
const emptyTarget = join(tmp, 'empty');
const initializedTarget = join(tmp, 'initialized');

mkdirSync(emptyTarget);
mkdirSync(initializedTarget);

try {
  console.log('Devflow explain smoke test');
  console.log(`Temp dir: ${tmp}`);

  const emptyReport = runJson(['--target', emptyTarget]);
  check(emptyReport.core.status === 'missing', 'empty dir reports missing core', JSON.stringify(emptyReport.core));
  check(emptyReport.workflows.length === 0, 'empty dir has no workflows', JSON.stringify(emptyReport.workflows));
  check(
    emptyReport.recommendations.includes(`devflow init --merge --target ${JSON.stringify(emptyTarget)}`),
    'empty dir recommends init --merge',
    JSON.stringify(emptyReport.recommendations),
  );

  run(['init', '--target', initializedTarget, '--merge']);

  const initializedReport = runJson(['--target', initializedTarget]);
  check(initializedReport.core.status === 'ok', 'initialized dir reports healthy core', JSON.stringify(initializedReport.core));
  check(initializedReport.workflows.includes('plan'), 'initialized dir exposes plan workflow', JSON.stringify(initializedReport.workflows));
  check(initializedReport.adapters.generic.present === true, 'initialized dir detects generic adapter', JSON.stringify(initializedReport.adapters.generic));
  check(
    initializedReport.sources.some((source) => source.endsWith('AGENTS.md')),
    'initialized dir includes AGENTS.md in sources',
    JSON.stringify(initializedReport.sources),
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
