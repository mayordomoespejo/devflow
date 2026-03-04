#!/usr/bin/env node
/**
 * Smoke test for devflow doctor.
 * Verifies:
 * - empty directory reports missing core and recommends init
 * - initialized directory reports healthy core and no issues
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
  return JSON.parse(execFileSync('node', [CLI, 'doctor', '--json', ...args], { encoding: 'utf8' }));
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

const tmp = mkdtempSync(join(tmpdir(), 'devflow-doctor-'));
const emptyTarget = join(tmp, 'empty');
const initializedTarget = join(tmp, 'initialized');

mkdirSync(emptyTarget);
mkdirSync(initializedTarget);

try {
  console.log('Devflow doctor smoke test');
  console.log(`Temp dir: ${tmp}`);

  const emptyReport = runJson(['--target', emptyTarget]);
  check(emptyReport.core.status === 'missing', 'empty dir reports missing core', JSON.stringify(emptyReport.core));
  check(emptyReport.core.workflowsConfig === false, 'empty dir reports no workflow config', JSON.stringify(emptyReport.core));
  check(
    emptyReport.issues.some((issue) => issue.id === 'devflow-not-installed'),
    'empty dir reports devflow-not-installed issue',
    JSON.stringify(emptyReport.issues),
  );
  check(
    emptyReport.recommendations.includes(`devflow init --merge --target ${JSON.stringify(emptyTarget)}`),
    'empty dir recommends init --merge',
    JSON.stringify(emptyReport.recommendations),
  );

  run(['init', '--target', initializedTarget, '--merge']);

  const initializedReport = runJson(['--target', initializedTarget]);
  check(initializedReport.core.status === 'ok', 'initialized dir reports healthy core', JSON.stringify(initializedReport.core));
  check(initializedReport.core.workflowsConfig === true, 'initialized dir detects workflow config', JSON.stringify(initializedReport.core));
  check(initializedReport.adapters.generic.present === true, 'initialized dir detects generic adapter', JSON.stringify(initializedReport.adapters.generic));
  check(initializedReport.issues.length === 0, 'initialized dir has no issues', JSON.stringify(initializedReport.issues));
  check(
    initializedReport.recommendations.includes('No action needed.'),
    'initialized dir reports no action needed',
    JSON.stringify(initializedReport.recommendations),
  );
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`\nResults: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
