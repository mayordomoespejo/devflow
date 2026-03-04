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
  // ── common ──────────────────────────────────────────────────────────────
  'common/AGENTS.md',

  // ── cursor ──────────────────────────────────────────────────────────────
  'cursor/.cursor/commands/plan.md',
  'cursor/.cursor/commands/review.md',
  'cursor/.cursor/commands/tests.md',
  'cursor/.cursor/commands/verify.md',
  'cursor/.cursor/rules/typescript.md',

  // ── claude ──────────────────────────────────────────────────────────────
  'claude/.claude/commands/plan.md',
  'claude/.claude/commands/review.md',
  'claude/.claude/commands/tests.md',
  'claude/.claude/commands/verify.md',
  'claude/.claude/rules/typescript.md',

  // ── codex (instruction-based, no commands) ──────────────────────────────
  'codex/INSTRUCTIONS.md',

  // ── gemini (instruction-based, no commands) ─────────────────────────────
  'gemini/INSTRUCTIONS.md',
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
