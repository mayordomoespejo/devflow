#!/usr/bin/env node
/**
 * Validates that all required Devflow template files exist.
 * Fails with exit code 1 if any are missing.
 * Run before smoke tests or npm publish.
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES  = join(__dirname, '..', 'templates');

const REQUIRED = [
  'core/AGENTS.md',
  'core/DEVFLOW.md',
  'prompts/plan.txt',
  'prompts/build.txt',
  'prompts/tests.txt',
  'prompts/review.txt',
  'prompts/verify.txt',
  'adapters/cursor/.cursor/commands/plan.md',
  'adapters/cursor/.cursor/commands/review.md',
  'adapters/cursor/.cursor/commands/tests.md',
  'adapters/cursor/.cursor/commands/verify.md',
  'adapters/cursor/.cursor/rules/typescript.md',
  'adapters/claude-code/README.md',
  'adapters/codex/README.md',
  'adapters/generic/README.md',
];

let failed = 0;

for (const rel of REQUIRED) {
  const abs = join(TEMPLATES, rel);
  if (existsSync(abs)) {
    console.log(`  ok  templates/${rel}`);
  } else {
    console.error(`  !!  templates/${rel}  (MISSING)`);
    failed++;
  }
}

console.log('');

if (failed > 0) {
  console.error(`Template validation failed: ${failed} file(s) missing.`);
  process.exit(1);
}

console.log(`All ${REQUIRED.length} template files present.`);
