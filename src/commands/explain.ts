import * as path from 'path';
import { PROMPT_WORKFLOWS, DOCTOR_ADAPTERS } from '../constants';
import { exists, resolveTarget } from '../install';
import { Installation, ExplainReport } from '../types';
import { buildDoctorReport } from './doctor';

const pkg = require('../../package.json') as { version: string };

const CURSOR_WORKFLOW_FILES: Record<string, string> = {
  plan:   path.join('.cursor', 'commands', 'plan.md'),
  build:  path.join('.cursor', 'commands', 'build.md'),
  tests:  path.join('.cursor', 'commands', 'tests.md'),
  review: path.join('.cursor', 'commands', 'review.md'),
  verify: path.join('.cursor', 'commands', 'verify.md'),
};

const CLAUDE_WORKFLOW_FILES: Record<string, string> = {
  plan:   path.join('.claude', 'commands', 'plan.md'),
  build:  path.join('.claude', 'commands', 'build.md'),
  tests:  path.join('.claude', 'commands', 'tests.md'),
  review: path.join('.claude', 'commands', 'review.md'),
  verify: path.join('.claude', 'commands', 'verify.md'),
};

function buildExplainWorkflows(inspection: Installation): string[] {
  const workflows = new Set<string>();

  for (const workflow of PROMPT_WORKFLOWS) {
    if (inspection.core.promptFiles[workflow]) {
      workflows.add(workflow);
    }
  }

  for (const [workflow, file] of Object.entries(CURSOR_WORKFLOW_FILES)) {
    const cursorAdapter = inspection.adapters.cursor;
    if (cursorAdapter?.expected.includes(file) && cursorAdapter.present && !cursorAdapter.missing.includes(file)) {
      workflows.add(workflow);
    }
  }

  for (const [workflow, file] of Object.entries(CLAUDE_WORKFLOW_FILES)) {
    const claudeAdapter = inspection.adapters.claude;
    if (claudeAdapter?.expected.includes(file) && claudeAdapter.present && !claudeAdapter.missing.includes(file)) {
      workflows.add(workflow);
    }
  }

  return [...workflows];
}

function buildExplainSources(targetDir: string, inspection: Installation): string[] {
  const sources: string[] = [];

  if (inspection.core.agentsMd)       sources.push(path.join(targetDir, 'AGENTS.md'));
  if (inspection.core.devflowMd)      sources.push(path.join(targetDir, 'DEVFLOW.md'));
  if (inspection.core.workflowsConfig) sources.push(path.join(targetDir, '.devflow', 'workflows.yml'));

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

function buildExplainRecommendations(targetDir: string, cwd: string, inspection: Installation): string[] {
  const recommendations: string[] = [];
  const { detectedAdapters } = inspection;
  const partialAdapters = Object.entries(inspection.adapters)
    .filter(([, details]) => details.status === 'partial')
    .map(([name]) => name);
  const anyDevflowPresence = inspection.core.agentsMd
    || inspection.core.devflowMd
    || inspection.core.prompts
    || detectedAdapters.length > 0;

  const buildCmd = (adapters: string[]) => {
    const parts = ['devflow', 'init'];
    if (adapters.length === 1)      parts.push('--adapter', adapters[0]);
    else if (adapters.length > 1)   parts.push('--adapters', adapters.join(','));
    parts.push('--merge');
    if (path.resolve(targetDir) !== path.resolve(cwd)) parts.push('--target', JSON.stringify(targetDir));
    return parts.join(' ');
  };

  if (!anyDevflowPresence) {
    recommendations.push(buildCmd([]));
  } else if (inspection.core.missing.length > 0) {
    recommendations.push(buildCmd(detectedAdapters));
  }

  for (const adapter of partialAdapters) {
    recommendations.push(buildCmd([adapter]));
  }

  if (recommendations.length === 0) {
    recommendations.push('No action needed.');
  }

  return [...new Set(recommendations)];
}

function buildExplainReport(targetDir: string, cwd: string): ExplainReport {
  // Reuse inspectInstallation via doctor report internals
  const doctorReport = buildDoctorReport(targetDir, cwd);
  const inspection: Installation = {
    core: doctorReport.core,
    adapters: doctorReport.adapters,
    detectedAdapters: Object.entries(doctorReport.adapters)
      .filter(([, d]) => d.present)
      .map(([name]) => name),
  };

  return {
    version: pkg.version,
    target: targetDir,
    core: inspection.core,
    adapters: inspection.adapters,
    workflows: buildExplainWorkflows(inspection),
    sources: buildExplainSources(targetDir, inspection),
    sourceOfCriteria: "Rules are defined by installed Devflow files in this project (AGENTS.md, DEVFLOW.md, prompts, and adapters). System instructions may also apply, but Devflow's intended source of behavior is the project files.",
    recommendations: buildExplainRecommendations(targetDir, cwd, inspection),
  };
}

function printExplainHuman(report: ExplainReport, options: { verbose?: boolean }): void {
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

export function runExplain(options: { target?: string; json?: boolean; verbose?: boolean }): void {
  const targetDir = resolveTarget(options.target ?? process.cwd());
  const report = buildExplainReport(targetDir, process.cwd());

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  printExplainHuman(report, options);
}
