#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

// ─── helpers ────────────────────────────────────────────────────────────────

function collectTemplateFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = base ? path.join(base, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectTemplateFiles(path.join(dir, entry.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

function resolveTarget(raw) {
  const resolved = path.resolve(raw);
  if (!fs.existsSync(resolved)) {
    console.error(`Error: target path does not exist: ${resolved}`);
    process.exit(1);
  }
  if (!fs.statSync(resolved).isDirectory()) {
    console.error(`Error: target is not a directory: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

function findConflicts(files, targetDir) {
  return files.filter((f) => fs.existsSync(path.join(targetDir, f)));
}

function copyFile(relPath, srcDir, destDir) {
  const src = path.join(srcDir, relPath);
  const dest = path.join(destDir, relPath);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function verify(files, targetDir) {
  const missing = files.filter((f) => !fs.existsSync(path.join(targetDir, f)));
  return missing;
}

// ─── init command ────────────────────────────────────────────────────────────

function runInit(options) {
  const targetDir = resolveTarget(options.target || process.cwd());
  const dryRun = Boolean(options.dryRun);
  const force = Boolean(options.force);

  let files;
  try {
    files = collectTemplateFiles(TEMPLATES_DIR);
  } catch (err) {
    console.error(`Error: could not read templates directory.\n${err.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error('Error: templates directory is empty.');
    process.exit(1);
  }

  const conflicts = findConflicts(files, targetDir);

  if (conflicts.length > 0 && !force && !dryRun) {
    console.error('Error: the following files already exist in the target:');
    conflicts.forEach((f) => console.error(`  ${f}`));
    console.error('\nUse --force to overwrite, or --dry-run to preview.');
    process.exit(1);
  }

  if (dryRun) {
    console.log(`Devflow: dry run — target: ${targetDir}\n`);
    for (const f of files) {
      const exists = fs.existsSync(path.join(targetDir, f));
      const tag = exists ? '[overwrite]' : '[create]  ';
      console.log(`  ${tag}  ${f}`);
    }
    console.log('\nDry run complete. Run without --dry-run to apply.');
    return;
  }

  const label = force ? ' (force)' : '';
  console.log(`Devflow: installing into ${targetDir}${label}\n`);

  for (const f of files) {
    try {
      const existed = fs.existsSync(path.join(targetDir, f));
      copyFile(f, TEMPLATES_DIR, targetDir);
      const suffix = existed ? ' (overwritten)' : '';
      console.log(`  ✓  ${f}${suffix}`);
    } catch (err) {
      console.error(`  ✗  ${f}  →  ${err.message}`);
      process.exit(1);
    }
  }

  const missing = verify(files, targetDir);
  if (missing.length > 0) {
    console.error('\nValidation failed — these files were not written:');
    missing.forEach((f) => console.error(`  ${f}`));
    process.exit(1);
  }

  console.log('\nDone. Devflow installed successfully.');
}

// ─── program ─────────────────────────────────────────────────────────────────

program
  .name('devflow')
  .description('AI-assisted development toolkit for Cursor')
  .version(pkg.version, '-v, --version');

program
  .command('init')
  .description('Install Devflow into the current project')
  .option('-f, --force', 'overwrite existing files')
  .option('-n, --dry-run', 'preview operations without writing')
  .option('-t, --target <path>', 'install into a different directory', process.cwd())
  .action(runInit);

program.parse(process.argv);
