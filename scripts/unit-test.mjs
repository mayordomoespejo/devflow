#!/usr/bin/env node
/**
 * Unit tests for Devflow core logic.
 * Uses Node.js built-in test runner (node:test) — no extra dependencies.
 * Tests import compiled modules from dist/.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');

// Dynamic imports so failures don't block each other
const { parseAdapterList, validate, detectDefaultAdapters, isManaged } =
  await import(`${DIST}/install.js`);
const { ADAPTER_CONFIG, ALL_ADAPTERS, MANAGED_PREFIXES } =
  await import(`${DIST}/constants.js`);
const { buildDoctorReport } =
  await import(`${DIST}/commands/doctor.js`);

// ─── parseAdapterList ────────────────────────────────────────────────────────

test('parseAdapterList: undefined returns empty array', () => {
  assert.deepEqual(parseAdapterList(undefined), []);
});

test('parseAdapterList: empty string returns empty array', () => {
  assert.deepEqual(parseAdapterList(''), []);
});

test('parseAdapterList: "none" returns empty array', () => {
  assert.deepEqual(parseAdapterList('none'), []);
});

test('parseAdapterList: "all" returns all adapters', () => {
  assert.deepEqual(parseAdapterList('all'), ALL_ADAPTERS);
});

test('parseAdapterList: single valid adapter', () => {
  assert.deepEqual(parseAdapterList('cursor'), ['cursor']);
});

test('parseAdapterList: multiple valid adapters', () => {
  assert.deepEqual(parseAdapterList('cursor,generic'), ['cursor', 'generic']);
});

test('parseAdapterList: deduplicates', () => {
  assert.deepEqual(parseAdapterList('cursor,cursor'), ['cursor']);
});

test('parseAdapterList: trims whitespace', () => {
  assert.deepEqual(parseAdapterList(' cursor , claude '), ['cursor', 'claude']);
});

// Note: parseAdapterList calls process.exit for invalid combos — covered by smoke tests.

// ─── ADAPTER_CONFIG ──────────────────────────────────────────────────────────

test('ADAPTER_CONFIG: cursor has required shape', () => {
  assert.ok(ADAPTER_CONFIG.cursor.srcDir);
  assert.ok(typeof ADAPTER_CONFIG.cursor.destDir === 'string');
  assert.ok(ADAPTER_CONFIG.cursor.keyFile);
});

test('ADAPTER_CONFIG: claude has required shape', () => {
  assert.ok(ADAPTER_CONFIG.claude.srcDir);
  assert.ok(typeof ADAPTER_CONFIG.claude.destDir === 'string');
  assert.ok(ADAPTER_CONFIG.claude.keyFile);
});

test('ADAPTER_CONFIG: claude keyFile points to .claude/commands/plan.md', () => {
  assert.ok(ADAPTER_CONFIG.claude.keyFile.includes('plan.md'));
  assert.ok(ADAPTER_CONFIG.claude.keyFile.includes('.claude'));
});

test('ADAPTER_CONFIG: all expected adapters present', () => {
  for (const name of ['cursor', 'claude', 'codex', 'gemini', 'generic']) {
    assert.ok(Object.prototype.hasOwnProperty.call(ADAPTER_CONFIG, name), `Missing adapter: ${name}`);
  }
});

// ─── MANAGED_PREFIXES ────────────────────────────────────────────────────────

test('MANAGED_PREFIXES: contains expected entries', () => {
  assert.ok(MANAGED_PREFIXES.has('AGENTS.md'));
  assert.ok(MANAGED_PREFIXES.has('DEVFLOW.md'));
  assert.ok(MANAGED_PREFIXES.has('.cursor'));
  assert.ok(MANAGED_PREFIXES.has('.claude'));
  assert.ok(MANAGED_PREFIXES.has('.devflow'));
  assert.ok(MANAGED_PREFIXES.has('devflow'));
});

// ─── isManaged ───────────────────────────────────────────────────────────────

test('isManaged: AGENTS.md is managed', () => {
  assert.equal(isManaged('AGENTS.md'), true);
});

test('isManaged: .cursor/commands/plan.md is managed', () => {
  assert.equal(isManaged('.cursor/commands/plan.md'), true);
});

test('isManaged: .claude/commands/plan.md is managed', () => {
  assert.equal(isManaged('.claude/commands/plan.md'), true);
});

test('isManaged: .devflow/workflows.yml is managed', () => {
  assert.equal(isManaged('.devflow/workflows.yml'), true);
});

test('isManaged: README.md is NOT managed', () => {
  assert.equal(isManaged('README.md'), false);
});

test('isManaged: src/index.ts is NOT managed', () => {
  assert.equal(isManaged('src/index.ts'), false);
});

// ─── detectDefaultAdapters ──────────────────────────────────────────────────

test('detectDefaultAdapters: detects .cursor directory', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    mkdirSync(join(tmp, '.cursor'));
    assert.deepEqual(detectDefaultAdapters(tmp), ['cursor']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('detectDefaultAdapters: detects .claude directory', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    mkdirSync(join(tmp, '.claude'));
    assert.deepEqual(detectDefaultAdapters(tmp), ['claude']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('detectDefaultAdapters: falls back to generic', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    assert.deepEqual(detectDefaultAdapters(tmp), ['generic']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('detectDefaultAdapters: .cursor takes precedence over .claude', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    mkdirSync(join(tmp, '.cursor'));
    mkdirSync(join(tmp, '.claude'));
    assert.deepEqual(detectDefaultAdapters(tmp), ['cursor']);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── validate ────────────────────────────────────────────────────────────────

test('validate: returns empty array when all core files present', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    writeFileSync(join(tmp, 'AGENTS.md'), '');
    writeFileSync(join(tmp, 'DEVFLOW.md'), '');
    mkdirSync(join(tmp, 'devflow', 'prompts'), { recursive: true });
    for (const f of ['plan', 'build', 'tests', 'review', 'verify']) {
      writeFileSync(join(tmp, 'devflow', 'prompts', `${f}.txt`), '');
    }
    const failures = validate([], tmp);
    assert.deepEqual(failures, []);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('validate: reports missing AGENTS.md', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    const failures = validate([], tmp);
    assert.ok(failures.some((f) => f.includes('AGENTS.md')));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('validate: reports missing adapter keyFile', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    writeFileSync(join(tmp, 'AGENTS.md'), '');
    writeFileSync(join(tmp, 'DEVFLOW.md'), '');
    mkdirSync(join(tmp, 'devflow', 'prompts'), { recursive: true });
    for (const f of ['plan', 'build', 'tests', 'review', 'verify']) {
      writeFileSync(join(tmp, 'devflow', 'prompts', `${f}.txt`), '');
    }
    const failures = validate(['cursor'], tmp);
    assert.ok(failures.some((f) => f.includes('cursor')));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── buildDoctorReport ───────────────────────────────────────────────────────

test('buildDoctorReport: empty dir reports devflow-not-installed', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    const report = buildDoctorReport(tmp, tmp);
    assert.ok(report.issues.some((i) => i.id === 'devflow-not-installed'));
    assert.equal(report.core.status, 'missing');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('buildDoctorReport: healthy install has no issues', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    writeFileSync(join(tmp, 'AGENTS.md'), '');
    writeFileSync(join(tmp, 'DEVFLOW.md'), '');
    mkdirSync(join(tmp, 'devflow', 'prompts'), { recursive: true });
    for (const f of ['plan', 'build', 'tests', 'review', 'verify']) {
      writeFileSync(join(tmp, 'devflow', 'prompts', `${f}.txt`), '');
    }
    const report = buildDoctorReport(tmp, tmp);
    assert.equal(report.core.status, 'ok');
    assert.equal(report.issues.length, 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('buildDoctorReport: partial cursor install warns', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    writeFileSync(join(tmp, 'AGENTS.md'), '');
    writeFileSync(join(tmp, 'DEVFLOW.md'), '');
    mkdirSync(join(tmp, 'devflow', 'prompts'), { recursive: true });
    for (const f of ['plan', 'build', 'tests', 'review', 'verify']) {
      writeFileSync(join(tmp, 'devflow', 'prompts', `${f}.txt`), '');
    }
    // Install only plan.md — partial cursor install
    mkdirSync(join(tmp, '.cursor', 'commands'), { recursive: true });
    writeFileSync(join(tmp, '.cursor', 'commands', 'plan.md'), '');

    const report = buildDoctorReport(tmp, tmp);
    assert.ok(report.issues.some((i) => i.id === 'cursor-partial'));
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('buildDoctorReport: includes version', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'devflow-unit-'));
  try {
    const report = buildDoctorReport(tmp, tmp);
    assert.ok(typeof report.version === 'string');
    assert.ok(report.version.length > 0);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
