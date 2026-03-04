import * as path from 'path';
import { AdapterConfig, DoctorAdapterConfig } from './types';

export const TEMPLATES_ROOT = path.join(__dirname, '..', 'templates');
export const PLUGINS_FILE   = path.join('.devflow', 'plugins.yml');

export const ADAPTER_CONFIG: Record<string, AdapterConfig> = {
  cursor: {
    srcDir:  path.join('adapters', 'cursor'),
    destDir: '',
    keyFile: path.join('.cursor', 'commands', 'plan.md'),
  },
  claude: {
    srcDir:  path.join('adapters', 'claude'),
    destDir: '',
    keyFile: path.join('.claude', 'commands', 'plan.md'),
  },
  codex: {
    srcDir:  path.join('adapters', 'codex'),
    destDir: path.join('.devflow', 'adapters', 'codex'),
    keyFile: path.join('.devflow', 'adapters', 'codex', 'README.md'),
  },
  gemini: {
    srcDir:  path.join('adapters', 'gemini'),
    destDir: path.join('.devflow', 'adapters', 'gemini'),
    keyFile: path.join('.devflow', 'adapters', 'gemini', 'README.md'),
  },
  generic: {
    srcDir:  path.join('adapters', 'generic'),
    destDir: '.devflow',
    keyFile: path.join('.devflow', 'README.md'),
  },
};

export const ALL_ADAPTERS = Object.keys(ADAPTER_CONFIG);

export const DEFAULT_CURSOR_MARKER = '.cursor';
export const DEFAULT_CLAUDE_MARKER = '.claude';

export const CORE_KEY_FILES = [
  'AGENTS.md',
  'DEVFLOW.md',
  path.join('devflow', 'prompts', 'plan.txt'),
  path.join('devflow', 'prompts', 'build.txt'),
  path.join('devflow', 'prompts', 'tests.txt'),
  path.join('devflow', 'prompts', 'review.txt'),
  path.join('devflow', 'prompts', 'verify.txt'),
];

export const PROMPT_WORKFLOWS = ['plan', 'build', 'tests', 'review', 'verify'];

export const DOCTOR_ADAPTERS: Record<string, DoctorAdapterConfig> = {
  cursor: {
    expected: [
      path.join('.cursor', 'commands', 'plan.md'),
      path.join('.cursor', 'commands', 'build.md'),
      path.join('.cursor', 'commands', 'tests.md'),
      path.join('.cursor', 'commands', 'review.md'),
      path.join('.cursor', 'commands', 'verify.md'),
      path.join('.cursor', 'rules', 'typescript.md'),
    ],
  },
  claude: {
    expected: [
      path.join('.claude', 'commands', 'plan.md'),
      path.join('.claude', 'commands', 'build.md'),
      path.join('.claude', 'commands', 'tests.md'),
      path.join('.claude', 'commands', 'review.md'),
      path.join('.claude', 'commands', 'verify.md'),
    ],
  },
  codex: {
    expected: [path.join('.devflow', 'adapters', 'codex', 'README.md')],
  },
  gemini: {
    expected: [path.join('.devflow', 'adapters', 'gemini', 'README.md')],
  },
  generic: {
    expected: [path.join('.devflow', 'README.md')],
  },
};

// Paths Devflow is allowed to create or overwrite.
// --force will never touch files outside these prefixes.
export const MANAGED_PREFIXES = new Set([
  'AGENTS.md', 'DEVFLOW.md',
  '.claude', '.cursor', '.devflow',
  'devflow',
]);

export function isManaged(dest: string): boolean {
  return MANAGED_PREFIXES.has(dest.split(path.sep)[0]);
}
