#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const pkg = require('../package.json');
const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');

// Per-adapter configuration:
//   srcDir  — subdirectory inside templates/adapters/
//   destDir — prefix applied to every file's destination inside the target
//   keyFile — file checked by post-install validation (relative to target)
const ADAPTER_CONFIG = {
  cursor: {
    srcDir:  path.join('adapters', 'cursor'),
    destDir: '',
    keyFile: path.join('.cursor', 'commands', 'plan.md'),
  },
  'claude-code': {
    srcDir:  path.join('adapters', 'claude-code'),
    destDir: path.join('.devflow', 'adapters', 'claude-code'),
    keyFile: path.join('.devflow', 'adapters', 'claude-code', 'README.md'),
  },
  codex: {
    srcDir:  path.join('adapters', 'codex'),
    destDir: path.join('.devflow', 'adapters', 'codex'),
    keyFile: path.join('.devflow', 'adapters', 'codex', 'README.md'),
  },
  generic: {
    srcDir:  path.join('adapters', 'generic'),
    destDir: '.devflow',
    keyFile: path.join('.devflow', 'README.md'),
  },
};

const ADAPTER_ALIASES = {
  claude: 'claude-code',
};

const ALL_ADAPTERS = Object.keys(ADAPTER_CONFIG);
const DEFAULT_CURSOR_MARKER = '.cursor';
const CORE_KEY_FILES = [
  'AGENTS.md',
  'DEVFLOW.md',
  path.join('devflow', 'prompts', 'plan.txt'),
  path.join('devflow', 'prompts', 'build.txt'),
  path.join('devflow', 'prompts', 'tests.txt'),
  path.join('devflow', 'prompts', 'review.txt'),
  path.join('devflow', 'prompts', 'verify.txt'),
];

// Paths Devflow is allowed to create or overwrite.
// --force will never touch files outside these prefixes.
const MANAGED_PREFIXES = new Set([
  'AGENTS.md', 'DEVFLOW.md',
  '.cursor', '.devflow',
  'devflow',
]);

function isManaged(dest) {
  return MANAGED_PREFIXES.has(dest.split(path.sep)[0]);
}

// ─── helpers ────────────────────────────────────────────────────────────────

function collectFiles(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = base ? path.join(base, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...collectFiles(path.join(dir, entry.name), rel));
    } else {
      files.push(rel);
    }
  }
  return files;
}

// Returns [{ src: absolutePath, dest: relPathInTarget }].
// core/ root files (AGENTS.md, DEVFLOW.md) go to target root.
// prompts/ goes to target/devflow/prompts/ (namespaced to avoid clashes).
// Each adapter's srcDir is mapped to its destDir.
function buildInstallList(adapters) {
  const sources = [
    { srcDir: path.join(TEMPLATES_ROOT, 'core'),    destPrefix: '' },
    { srcDir: path.join(TEMPLATES_ROOT, 'prompts'), destPrefix: path.join('devflow', 'prompts') },
  ];
  for (const adapter of adapters) {
    const { srcDir, destDir } = ADAPTER_CONFIG[adapter];
    sources.push({ srcDir: path.join(TEMPLATES_ROOT, srcDir), destPrefix: destDir });
  }

  const items = [];
  for (const { srcDir, destPrefix } of sources) {
    if (!fs.existsSync(srcDir)) continue;
    for (const rel of collectFiles(srcDir)) {
      const dest = destPrefix ? path.join(destPrefix, rel) : rel;
      items.push({ src: path.join(srcDir, rel), dest });
    }
  }
  return items;
}

function parseAdapterList(raw) {
  if (!raw) return [];

  const adapters = raw
    .split(',')
    .map((tool) => tool.trim().toLowerCase())
    .map((tool) => ADAPTER_ALIASES[tool] ?? tool)
    .filter(Boolean);

  if (adapters.includes('all') && adapters.length > 1) {
    console.error('Error: "all" cannot be combined with other adapters.');
    process.exit(1);
  }

  if (adapters.includes('none') && adapters.length > 1) {
    console.error('Error: "none" cannot be combined with other adapters.');
    process.exit(1);
  }

  if (adapters.length === 1 && adapters[0] === 'all') {
    return ALL_ADAPTERS;
  }

  if (adapters.length === 1 && adapters[0] === 'none') {
    return [];
  }

  const invalid = adapters.filter((adapter) => !Object.prototype.hasOwnProperty.call(ADAPTER_CONFIG, adapter));
  if (invalid.length > 0) {
    console.error(`Error: unknown adapter(s): ${invalid.join(', ')}`);
    console.error(`Valid values: ${ALL_ADAPTERS.join(', ')}, none, all`);
    process.exit(1);
  }

  return [...new Set(adapters)];
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

function exists(dest, targetDir) {
  return fs.existsSync(path.join(targetDir, dest));
}

function copyItem({ src, dest }, targetDir) {
  const destPath = path.join(targetDir, dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(src, destPath);
}

// Checks core files (always) + one key file per selected adapter.
function validate(adapters, targetDir) {
  const failures = [];

  for (const file of CORE_KEY_FILES) {
    if (!exists(file, targetDir)) {
      failures.push(`${file} (from core)`);
    }
  }

  for (const adapter of adapters) {
    const { keyFile } = ADAPTER_CONFIG[adapter];
    if (keyFile && !exists(keyFile, targetDir)) {
      failures.push(`${keyFile} (${adapter})`);
    }
  }
  return failures;
}

function detectDefaultAdapters(targetDir) {
  if (fs.existsSync(path.join(targetDir, DEFAULT_CURSOR_MARKER))) {
    return ['cursor'];
  }

  return ['generic'];
}

function resolveAdapters(options, targetDir) {
  const adapterArg = options.adapters ?? options.adapter ?? options.tool;

  if (options.adapters && (options.adapter || options.tool)) {
    console.error('Error: use either --adapter/--tool or --adapters, not both.');
    process.exit(1);
  }

  if (!adapterArg) {
    return detectDefaultAdapters(targetDir);
  }

  return parseAdapterList(adapterArg);
}

// ─── init command ────────────────────────────────────────────────────────────

function runInit(options) {
  const targetDir = resolveTarget(options.target || process.cwd());
  const dryRun   = Boolean(options.dryRun);
  const force    = Boolean(options.force);
  const merge    = Boolean(options.merge) && !force; // force wins over merge
  const adapters = resolveAdapters(options, targetDir);

  let items;
  try {
    items = buildInstallList(adapters);
  } catch (err) {
    console.error(`Error: could not read templates.\n${err.message}`);
    process.exit(1);
  }

  if (items.length === 0) {
    console.error('Error: no template files found for the selected tools.');
    process.exit(1);
  }

  const conflicts = items.filter(({ dest }) => exists(dest, targetDir));

  // Abort only when there are conflicts and neither --force nor --merge is set
  if (conflicts.length > 0 && !force && !merge && !dryRun) {
    console.error('Error: the following files already exist in the target:');
    conflicts.forEach(({ dest }) => console.error(`  ${dest}`));
    console.error('\nUse --force to overwrite, --merge to skip existing, or --dry-run to preview.');
    process.exit(1);
  }

  if (dryRun) {
    const modeLabel = force ? ' --force' : merge ? ' --merge' : '';
    const installLabel = adapters.length > 0 ? `core + ${adapters.join(', ')}` : 'core only';
    console.log(`Devflow: dry run — target: ${targetDir}${modeLabel}`);
    console.log(`Install set: ${installLabel}\n`);
    for (const { dest } of items) {
      const fileExists = exists(dest, targetDir);
      let tag;
      if (!fileExists)              tag = '[create]   ';
      else if (!isManaged(dest))    tag = '[skip]     '; // never touch non-managed files
      else if (force)               tag = '[overwrite]';
      else if (merge)               tag = '[skip]     ';
      else                          tag = '[conflict] ';
      console.log(`  ${tag}  ${dest}`);
    }
    if (!force && !merge && conflicts.length > 0) {
      console.log('\n  Tip: use --force to overwrite or --merge to skip conflicts.');
    }
    console.log('\nDry run complete. Run without --dry-run to apply.');
    return;
  }

  const modeLabel = force ? ' (force)' : merge ? ' (merge)' : '';
  const installLabel = adapters.length > 0 ? `core + ${adapters.join(', ')}` : 'core only';
  console.log(`Devflow: installing into ${targetDir}${modeLabel}`);
  console.log(`Install set: ${installLabel}\n`);

  for (const item of items) {
    const existed = exists(item.dest, targetDir);
    if (existed && merge) {
      console.log(`  –  ${item.dest} (skipped)`);
      continue;
    }
    // Safety: never overwrite files outside Devflow-managed paths, even with --force.
    if (existed && !isManaged(item.dest)) {
      console.log(`  –  ${item.dest} (skipped – not Devflow-managed)`);
      continue;
    }
    try {
      copyItem(item, targetDir);
      const suffix = existed ? ' (overwritten)' : '';
      console.log(`  ✓  ${item.dest}${suffix}`);
    } catch (err) {
      console.error(`  ✗  ${item.dest}  →  ${err.message}`);
      process.exit(1);
    }
  }

  const failures = validate(adapters, targetDir);
  if (failures.length > 0) {
    console.error('\nValidation failed — these files are missing:');
    failures.forEach((f) => console.error(`  ${f}`));
    process.exit(1);
  }

  console.log('\nDone. Devflow installed successfully.');
}

// ─── program ─────────────────────────────────────────────────────────────────

program
  .name('devflow')
  .description('Universal AI development workflow toolkit — install the core plus optional adapters')
  .version(pkg.version, '-v, --version');

program
  .command('init')
  .description('Install Devflow core and optional adapters into the current project')
  .option('-f, --force', 'overwrite existing Devflow-managed files')
  .option('-m, --merge', 'install only files that do not yet exist (skip conflicts)')
  .option('-n, --dry-run', 'preview operations without writing')
  .option('-t, --target <path>', 'install into a different directory', process.cwd())
  .option(
    '--adapter <adapter>',
    `single adapter: ${ALL_ADAPTERS.join(', ')}, none (default: cursor if .cursor exists, otherwise generic)`,
  )
  .option(
    '--adapters <adapters>',
    `comma-separated adapters: ${ALL_ADAPTERS.join(', ')}, none, all`,
  )
  .option(
    '--tool <tools>',
    'deprecated alias for --adapter',
  )
  .action(runInit);

program.parse(process.argv);
