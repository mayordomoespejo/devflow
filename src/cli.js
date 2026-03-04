#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');

// Tool name → subdirectory inside templates/. null = no tool-specific files.
const TOOL_DIRS = {
  cursor: 'cursor',
  claude: 'claude',
  codex: null,   // codex uses common/AGENTS.md only
};

const ALL_TOOLS = Object.keys(TOOL_DIRS);

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

// Build install list from common/ + each tool's subdir.
// Returns [{ srcDir, rel }] where rel is the destination path inside the target.
function buildInstallList(tools) {
  const srcDirs = [path.join(TEMPLATES_ROOT, 'common')];
  for (const tool of tools) {
    const sub = TOOL_DIRS[tool];
    if (sub) srcDirs.push(path.join(TEMPLATES_ROOT, sub));
  }

  const items = [];
  for (const srcDir of srcDirs) {
    if (!fs.existsSync(srcDir)) continue;
    for (const rel of collectTemplateFiles(srcDir)) {
      items.push({ srcDir, rel });
    }
  }
  return items;
}

function parseTools(raw) {
  if (!raw || raw === 'all') return ALL_TOOLS;
  const tools = raw.split(',').map((t) => t.trim().toLowerCase());
  const invalid = tools.filter((t) => !TOOL_DIRS.hasOwnProperty(t));
  if (invalid.length > 0) {
    console.error(`Error: unknown tool(s): ${invalid.join(', ')}`);
    console.error(`Valid tools: ${ALL_TOOLS.join(', ')}, all`);
    process.exit(1);
  }
  return tools;
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

function findConflicts(items, targetDir) {
  return items.filter(({ rel }) => fs.existsSync(path.join(targetDir, rel)));
}

function copyItem({ srcDir, rel }, destDir) {
  const src = path.join(srcDir, rel);
  const dest = path.join(destDir, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function verify(items, targetDir) {
  return items.filter(({ rel }) => !fs.existsSync(path.join(targetDir, rel)));
}

// ─── init command ────────────────────────────────────────────────────────────

function runInit(options) {
  const targetDir = resolveTarget(options.target || process.cwd());
  const dryRun = Boolean(options.dryRun);
  const force = Boolean(options.force);
  const tools = parseTools(options.tool);

  let items;
  try {
    items = buildInstallList(tools);
  } catch (err) {
    console.error(`Error: could not read templates.\n${err.message}`);
    process.exit(1);
  }

  if (items.length === 0) {
    console.error('Error: no template files found for the selected tools.');
    process.exit(1);
  }

  const conflicts = findConflicts(items, targetDir);

  if (conflicts.length > 0 && !force && !dryRun) {
    console.error('Error: the following files already exist in the target:');
    conflicts.forEach(({ rel }) => console.error(`  ${rel}`));
    console.error('\nUse --force to overwrite, or --dry-run to preview.');
    process.exit(1);
  }

  if (dryRun) {
    console.log(`Devflow: dry run — target: ${targetDir}\n`);
    for (const { rel } of items) {
      const exists = fs.existsSync(path.join(targetDir, rel));
      const tag = exists ? '[overwrite]' : '[create]  ';
      console.log(`  ${tag}  ${rel}`);
    }
    console.log('\nDry run complete. Run without --dry-run to apply.');
    return;
  }

  const label = force ? ' (force)' : '';
  console.log(`Devflow: installing into ${targetDir}${label}\n`);

  for (const item of items) {
    try {
      const existed = fs.existsSync(path.join(targetDir, item.rel));
      copyItem(item, targetDir);
      const suffix = existed ? ' (overwritten)' : '';
      console.log(`  ✓  ${item.rel}${suffix}`);
    } catch (err) {
      console.error(`  ✗  ${item.rel}  →  ${err.message}`);
      process.exit(1);
    }
  }

  const missing = verify(items, targetDir);
  if (missing.length > 0) {
    console.error('\nValidation failed — these files were not written:');
    missing.forEach(({ rel }) => console.error(`  ${rel}`));
    process.exit(1);
  }

  console.log('\nDone. Devflow installed successfully.');
}

// ─── program ─────────────────────────────────────────────────────────────────

program
  .name('devflow')
  .description('AI-assisted development toolkit for Cursor, Claude Code, and Codex')
  .version(pkg.version, '-v, --version');

program
  .command('init')
  .description('Install Devflow into the current project')
  .option('-f, --force', 'overwrite existing files')
  .option('-n, --dry-run', 'preview operations without writing')
  .option('-t, --target <path>', 'install into a different directory', process.cwd())
  .option('--tool <tools>', `tools to install: ${ALL_TOOLS.join(', ')}, all (default: all)`, 'all')
  .action(runInit);

program.parse(process.argv);
