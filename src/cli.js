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
const PROMPT_WORKFLOWS = ['plan', 'build', 'tests', 'review', 'verify'];
const DOCTOR_ADAPTERS = {
  cursor: {
    expected: [
      path.join('.cursor', 'commands', 'plan.md'),
      path.join('.cursor', 'commands', 'tests.md'),
      path.join('.cursor', 'commands', 'review.md'),
      path.join('.cursor', 'commands', 'verify.md'),
      path.join('.cursor', 'rules', 'typescript.md'),
    ],
  },
  generic: {
    expected: [path.join('.devflow', 'README.md')],
  },
  'claude-code': {
    expected: [path.join('.devflow', 'adapters', 'claude-code', 'README.md')],
  },
  codex: {
    expected: [path.join('.devflow', 'adapters', 'codex', 'README.md')],
  },
};

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

function hasAnyPath(targetDir, paths) {
  return paths.some((rel) => exists(rel, targetDir));
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

function inspectCore(targetDir) {
  const agentsMd = exists('AGENTS.md', targetDir);
  const devflowMd = exists('DEVFLOW.md', targetDir);
  const workflowsConfig = exists(path.join('.devflow', 'workflows.yml'), targetDir);
  const promptsDir = exists(path.join('devflow', 'prompts'), targetDir);
  const planPrompt = exists(path.join('devflow', 'prompts', 'plan.txt'), targetDir);
  const promptFiles = Object.fromEntries(
    PROMPT_WORKFLOWS.map((workflow) => [workflow, exists(path.join('devflow', 'prompts', `${workflow}.txt`), targetDir)]),
  );
  const prompts = promptsDir && planPrompt;
  const missing = [];

  if (!agentsMd) missing.push('AGENTS.md');
  if (!devflowMd) missing.push('DEVFLOW.md');
  if (!promptsDir) missing.push(path.join('devflow', 'prompts'));
  if (promptsDir && !planPrompt) missing.push(path.join('devflow', 'prompts', 'plan.txt'));

  return {
    agentsMd,
    devflowMd,
    workflowsConfig,
    prompts,
    promptFiles,
    missing,
    status: missing.length === 0 ? 'ok' : 'missing',
  };
}

function inspectAdapter(name, targetDir) {
  const expected = DOCTOR_ADAPTERS[name].expected;
  const missing = expected.filter((rel) => !exists(rel, targetDir));
  const present = hasAnyPath(targetDir, expected);

  return {
    present,
    missing,
    expected,
    status: !present ? 'absent' : missing.length === 0 ? 'ok' : 'partial',
  };
}

function inspectInstallation(targetDir) {
  const core = inspectCore(targetDir);
  const adapters = {};

  for (const adapter of Object.keys(DOCTOR_ADAPTERS)) {
    adapters[adapter] = inspectAdapter(adapter, targetDir);
  }

  return {
    core,
    adapters,
    detectedAdapters: Object.entries(adapters)
      .filter(([, details]) => details.present)
      .map(([name]) => name),
  };
}

function severityRank(severity) {
  return severity === 'error' ? 0 : 1;
}

function buildRecommendationCommand(targetDir, cwd, adapters) {
  const parts = ['devflow', 'init'];

  if (adapters.length === 1) {
    parts.push('--adapter', adapters[0]);
  } else if (adapters.length > 1) {
    parts.push('--adapters', adapters.join(','));
  }

  parts.push('--merge');

  if (path.resolve(targetDir) !== path.resolve(cwd)) {
    parts.push('--target', JSON.stringify(targetDir));
  }

  return parts.join(' ');
}

function buildDoctorReport(targetDir, cwd) {
  const inspection = inspectInstallation(targetDir);
  const issues = [];
  const recommendations = [];
  const detectedAdapters = inspection.detectedAdapters;
  const partiallyInstalledAdapters = Object.entries(inspection.adapters)
    .filter(([, details]) => details.status === 'partial')
    .map(([name]) => name);
  const anyDevflowPresence = inspection.core.agentsMd
    || inspection.core.devflowMd
    || inspection.core.prompts
    || detectedAdapters.length > 0;

  if (!anyDevflowPresence) {
    issues.push({
      id: 'devflow-not-installed',
      severity: 'error',
      message: 'Devflow does not appear to be installed in the target.',
      fix: buildRecommendationCommand(targetDir, cwd, []),
    });
    recommendations.push(buildRecommendationCommand(targetDir, cwd, []));
  } else {
    if (inspection.core.missing.length > 0) {
      const coreAdapters = detectedAdapters.length > 0 ? detectedAdapters : [];
      issues.push({
        id: 'core-missing',
        severity: 'error',
        message: `Core installation is incomplete. Missing: ${inspection.core.missing.join(', ')}`,
        fix: buildRecommendationCommand(targetDir, cwd, coreAdapters),
      });
      recommendations.push(buildRecommendationCommand(targetDir, cwd, coreAdapters));
    }

    for (const adapter of partiallyInstalledAdapters) {
      issues.push({
        id: `${adapter}-partial`,
        severity: 'warn',
        message: `${adapter} adapter is partially installed. Missing: ${inspection.adapters[adapter].missing.join(', ')}`,
        fix: buildRecommendationCommand(targetDir, cwd, [adapter]),
      });
      recommendations.push(buildRecommendationCommand(targetDir, cwd, [adapter]));
    }
  }

  if (issues.length === 0) {
    recommendations.push('No action needed.');
  }

  issues.sort((a, b) => severityRank(a.severity) - severityRank(b.severity));

  return {
    version: pkg.version,
    target: targetDir,
    core: inspection.core,
    adapters: inspection.adapters,
    issues,
    recommendations: [...new Set(recommendations)],
  };
}

function buildExplainWorkflows(inspection) {
  const workflows = new Set();

  for (const workflow of PROMPT_WORKFLOWS) {
    if (inspection.core.promptFiles[workflow]) {
      workflows.add(workflow);
    }
  }

  const cursorWorkflowFiles = {
    plan: path.join('.cursor', 'commands', 'plan.md'),
    tests: path.join('.cursor', 'commands', 'tests.md'),
    review: path.join('.cursor', 'commands', 'review.md'),
    verify: path.join('.cursor', 'commands', 'verify.md'),
  };

  for (const [workflow, file] of Object.entries(cursorWorkflowFiles)) {
    if (inspection.adapters.cursor.expected.includes(file) && inspection.adapters.cursor.present && !inspection.adapters.cursor.missing.includes(file)) {
      workflows.add(workflow);
    }
  }

  return [...workflows];
}

function buildExplainSources(targetDir, inspection) {
  const sources = [];

  if (inspection.core.agentsMd) {
    sources.push(path.join(targetDir, 'AGENTS.md'));
  }
  if (inspection.core.devflowMd) {
    sources.push(path.join(targetDir, 'DEVFLOW.md'));
  }
  if (inspection.core.workflowsConfig) {
    sources.push(path.join(targetDir, '.devflow', 'workflows.yml'));
  }
  for (const workflow of PROMPT_WORKFLOWS) {
    if (inspection.core.promptFiles[workflow]) {
      sources.push(path.join(targetDir, 'devflow', 'prompts', `${workflow}.txt`));
    }
  }
  for (const [adapter, details] of Object.entries(inspection.adapters)) {
    for (const expected of details.expected) {
      if (!details.missing.includes(expected) && exists(expected, targetDir)) {
        sources.push(path.join(targetDir, expected));
      }
    }
    if (adapter === 'generic' && details.present && !details.missing.includes(path.join('.devflow', 'README.md'))) {
      sources.push(path.join(targetDir, '.devflow', 'README.md'));
    }
  }

  return [...new Set(sources)];
}

function buildExplainRecommendations(targetDir, cwd, inspection) {
  const recommendations = [];
  const detectedAdapters = inspection.detectedAdapters;
  const partialAdapters = Object.entries(inspection.adapters)
    .filter(([, details]) => details.status === 'partial')
    .map(([name]) => name);
  const anyDevflowPresence = inspection.core.agentsMd
    || inspection.core.devflowMd
    || inspection.core.prompts
    || detectedAdapters.length > 0;

  if (!anyDevflowPresence) {
    recommendations.push(buildRecommendationCommand(targetDir, cwd, []));
  } else if (inspection.core.missing.length > 0) {
    recommendations.push(buildRecommendationCommand(targetDir, cwd, detectedAdapters));
  }

  for (const adapter of partialAdapters) {
    recommendations.push(buildRecommendationCommand(targetDir, cwd, [adapter]));
  }

  if (recommendations.length === 0) {
    recommendations.push('No action needed.');
  }

  return [...new Set(recommendations)];
}

function buildExplainReport(targetDir, cwd) {
  const inspection = inspectInstallation(targetDir);

  return {
    version: pkg.version,
    target: targetDir,
    core: inspection.core,
    adapters: inspection.adapters,
    workflows: buildExplainWorkflows(inspection),
    sources: buildExplainSources(targetDir, inspection),
    sourceOfCriteria: 'Rules are defined by installed Devflow files in this project (AGENTS.md, DEVFLOW.md, prompts, and adapters). System instructions may also apply, but Devflow\'s intended source of behavior is the project files.',
    recommendations: buildExplainRecommendations(targetDir, cwd, inspection),
  };
}

function printDoctorHuman(report, options) {
  console.log('Devflow doctor');
  console.log(`Version: ${report.version}`);
  console.log(`Target: ${report.target}`);
  console.log('');
  console.log(`Core: ${report.core.status === 'ok' ? 'OK' : 'MISSING'}`);
  if (report.core.missing.length > 0) {
    console.log(`Missing core files: ${report.core.missing.join(', ')}`);
  }
  console.log(`Custom workflow config present: ${report.core.workflowsConfig ? 'yes' : 'no'}`);

  const detectedAdapters = Object.entries(report.adapters)
    .filter(([, details]) => details.present)
    .map(([name]) => name);

  console.log(`Adapters detected: ${detectedAdapters.length > 0 ? detectedAdapters.join(', ') : 'none'}`);

  if (options.verbose) {
    console.log('');
    console.log('Adapter details:');
    for (const [name, details] of Object.entries(report.adapters)) {
      console.log(`- ${name}: ${details.status}`);
      if (details.missing.length > 0) {
        console.log(`  missing: ${details.missing.join(', ')}`);
      }
    }
  }

  console.log('');
  console.log('Issues:');
  if (report.issues.length === 0) {
    console.log('- none');
  } else {
    for (const issue of report.issues) {
      console.log(`- [${issue.severity}] ${issue.message}`);
    }
  }

  console.log('');
  console.log('Recommended next command(s):');
  for (const recommendation of report.recommendations) {
    console.log(`- ${recommendation}`);
  }

  if (options.fix) {
    console.log('');
    console.log('Fix mode: no automatic safe fixes are available. Use the recommended command manually.');
  }
}

function runDoctor(options) {
  const targetDir = resolveTarget(options.target || process.cwd());
  const report = buildDoctorReport(targetDir, process.cwd());

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  printDoctorHuman(report, options);
}

function printExplainHuman(report, options) {
  const detectedAdapters = Object.entries(report.adapters)
    .filter(([, details]) => details.present)
    .map(([name]) => name);
  const missingCore = report.core.missing.length > 0 ? report.core.missing.join(', ') : 'none';

  console.log('Devflow explain');
  console.log(`Version: ${report.version}`);
  console.log(`Target: ${report.target}`);
  console.log('');
  console.log(`Core: ${report.core.status === 'ok' ? 'OK' : 'MISSING'}`);
  console.log(`Core missing: ${missingCore}`);
  console.log(`Custom workflow config present: ${report.core.workflowsConfig ? 'yes' : 'no'}`);
  console.log(`Adapters installed: ${detectedAdapters.length > 0 ? detectedAdapters.join(', ') : 'none'}`);
  console.log(`Workflows available: ${report.workflows.length > 0 ? report.workflows.join(', ') : 'none'}`);
  console.log('');
  console.log('Source of criteria:');
  console.log(report.sourceOfCriteria);

  if (options.verbose) {
    console.log('');
    console.log('Sources:');
    for (const source of report.sources) {
      console.log(`- ${source}`);
    }

    console.log('');
    console.log('Adapter checks:');
    for (const [name, details] of Object.entries(report.adapters)) {
      console.log(`- ${name}: ${details.status}`);
      if (details.missing.length > 0) {
        console.log(`  missing: ${details.missing.join(', ')}`);
      }
    }
  }

  console.log('');
  console.log('Recommended next command(s):');
  for (const recommendation of report.recommendations) {
    console.log(`- ${recommendation}`);
  }
}

function runExplain(options) {
  const targetDir = resolveTarget(options.target || process.cwd());
  const report = buildExplainReport(targetDir, process.cwd());

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  printExplainHuman(report, options);
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

program
  .command('doctor')
  .description('Diagnose the Devflow installation in the current project or another target')
  .option('-t, --target <path>', 'inspect a different directory', process.cwd())
  .option('-j, --json', 'output JSON only')
  .option('-f, --fix', 'show safe fix guidance when issues are found')
  .option('--verbose', 'include adapter details and missing files')
  .action(runDoctor);

program
  .command('explain')
  .description('Explain what parts of Devflow are installed and where the project rules come from')
  .option('-t, --target <path>', 'inspect a different directory', process.cwd())
  .option('-j, --json', 'output JSON only')
  .option('--verbose', 'include exact paths and extra checks')
  .action(runExplain);

program.parse(process.argv);
