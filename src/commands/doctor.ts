import * as path from 'path';
import * as fs from 'fs';
import { PROMPT_WORKFLOWS, DOCTOR_ADAPTERS } from '../constants';
import { exists, hasAnyPath, resolveTarget } from '../install';
import { readPluginsFile } from '../plugins';
import { CoreInspection, AdapterInspection, Installation, DoctorReport, PluginInspection } from '../types';

const pkg = require('../../package.json') as { version: string };

function inspectCore(targetDir: string): CoreInspection {
  const agentsMd       = exists('AGENTS.md', targetDir);
  const devflowMd      = exists('DEVFLOW.md', targetDir);
  const workflowsConfig = exists(path.join('.devflow', 'workflows.yml'), targetDir);
  const promptsDir     = exists(path.join('devflow', 'prompts'), targetDir);
  const planPrompt     = exists(path.join('devflow', 'prompts', 'plan.txt'), targetDir);
  const promptFiles    = Object.fromEntries(
    PROMPT_WORKFLOWS.map((w) => [w, exists(path.join('devflow', 'prompts', `${w}.txt`), targetDir)]),
  );
  const prompts = promptsDir && planPrompt;
  const missing: string[] = [];

  if (!agentsMd)   missing.push('AGENTS.md');
  if (!devflowMd)  missing.push('DEVFLOW.md');
  if (!promptsDir) missing.push(path.join('devflow', 'prompts'));
  if (promptsDir && !planPrompt) missing.push(path.join('devflow', 'prompts', 'plan.txt'));

  return {
    agentsMd, devflowMd, workflowsConfig, prompts, promptFiles, missing,
    status: missing.length === 0 ? 'ok' : 'missing',
  };
}

function inspectAdapter(name: string, targetDir: string): AdapterInspection {
  const expected = DOCTOR_ADAPTERS[name].expected;
  const missing  = expected.filter((rel) => !exists(rel, targetDir));
  const present  = hasAnyPath(targetDir, expected);

  return {
    present, missing, expected,
    status: !present ? 'absent' : missing.length === 0 ? 'ok' : 'partial',
  };
}

function inspectInstallation(targetDir: string): Installation {
  const core: CoreInspection = inspectCore(targetDir);
  const adapters: Record<string, AdapterInspection> = {};

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

function severityRank(severity: 'error' | 'warn'): number {
  return severity === 'error' ? 0 : 1;
}

function buildRecommendationCommand(targetDir: string, cwd: string, adapters: string[]): string {
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

function inspectPlugins(targetDir: string): PluginInspection[] {
  const { plugins } = readPluginsFile(targetDir);
  return plugins.map((p) => ({
    name: p.name,
    source: p.source,
    version: p.version,
    keyFile: p.keyFile,
    status: fs.existsSync(path.join(targetDir, p.keyFile)) ? 'ok' : 'missing',
  }));
}

export function buildDoctorReport(targetDir: string, cwd: string): DoctorReport {
  const inspection = inspectInstallation(targetDir);
  const plugins = inspectPlugins(targetDir);
  const issues: DoctorReport['issues'] = [];
  const recommendations: string[] = [];
  const { detectedAdapters } = inspection;
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

    for (const plugin of plugins) {
      if (plugin.status === 'missing') {
        issues.push({
          id: `plugin-${plugin.name}-missing`,
          severity: 'warn',
          message: `Plugin "${plugin.name}" key file is missing: ${plugin.keyFile}`,
          fix: `devflow add ${plugin.source}${path.resolve(targetDir) !== path.resolve(cwd) ? ` --target ${JSON.stringify(targetDir)}` : ''}`,
        });
      }
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
    plugins,
    issues,
    recommendations: [...new Set(recommendations)],
  };
}

function printDoctorHuman(report: DoctorReport, options: { verbose?: boolean; fix?: boolean }): void {
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
  console.log(`Plugins installed: ${report.plugins.length > 0 ? report.plugins.map((p) => p.name).join(', ') : 'none'}`);

  if (options.verbose) {
    console.log('');
    console.log('Adapter details:');
    for (const [name, details] of Object.entries(report.adapters)) {
      console.log(`- ${name}: ${details.status}`);
      if (details.missing.length > 0) {
        console.log(`  missing: ${details.missing.join(', ')}`);
      }
    }

    if (report.plugins.length > 0) {
      console.log('');
      console.log('Plugin details:');
      for (const plugin of report.plugins) {
        console.log(`- ${plugin.name} (${plugin.version}): ${plugin.status}`);
        if (plugin.status === 'missing') {
          console.log(`  missing key file: ${plugin.keyFile}`);
        }
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

export function runDoctor(options: { target?: string; json?: boolean; verbose?: boolean; fix?: boolean }): void {
  const targetDir = resolveTarget(options.target ?? process.cwd());
  const report = buildDoctorReport(targetDir, process.cwd());

  if (options.json) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }

  printDoctorHuman(report, options);
}
