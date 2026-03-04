#!/usr/bin/env node
/**
 * Validates the published Devflow template contract.
 * The source of truth is templates/:
 * - core/ is always installable
 * - prompts/ are always installable
 * - adapters/cursor/ is the only config-backed adapter
 * - other adapters must exist at least as README-based guidance
 */

import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES  = join(__dirname, '..', 'templates');

const REQUIRED_CORE = [
  'core/AGENTS.md',
  'core/DEVFLOW.md',
  'prompts/plan.txt',
  'prompts/build.txt',
  'prompts/tests.txt',
  'prompts/review.txt',
  'prompts/verify.txt',
];

const REQUIRED_CURSOR_ADAPTER = [
  'adapters/cursor/.cursor/commands/plan.md',
  'adapters/cursor/.cursor/commands/review.md',
  'adapters/cursor/.cursor/commands/tests.md',
  'adapters/cursor/.cursor/commands/verify.md',
  'adapters/cursor/.cursor/rules/typescript.md',
];

const REQUIRED_GUIDE_ADAPTERS = [
  'adapters/claude-code/README.md',
  'adapters/codex/README.md',
  'adapters/generic/README.md',
];

const REQUIRED = [
  ...REQUIRED_CORE,
  ...REQUIRED_CURSOR_ADAPTER,
  ...REQUIRED_GUIDE_ADAPTERS,
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
