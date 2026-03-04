import * as fs from 'fs';
import * as path from 'path';
import {
  TEMPLATES_ROOT, ADAPTER_CONFIG, ALL_ADAPTERS,
  DEFAULT_CURSOR_MARKER, DEFAULT_CLAUDE_MARKER,
  CORE_KEY_FILES, isManaged,
} from './constants';
import { InstallItem } from './types';

export function collectFiles(dir: string, base = ''): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
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
export function buildInstallList(adapters: string[]): InstallItem[] {
  const sources: Array<{ srcDir: string; destPrefix: string }> = [
    { srcDir: path.join(TEMPLATES_ROOT, 'core'),    destPrefix: '' },
    { srcDir: path.join(TEMPLATES_ROOT, 'prompts'), destPrefix: path.join('devflow', 'prompts') },
  ];
  for (const adapter of adapters) {
    const { srcDir, destDir } = ADAPTER_CONFIG[adapter];
    sources.push({ srcDir: path.join(TEMPLATES_ROOT, srcDir), destPrefix: destDir });
  }

  const items: InstallItem[] = [];
  for (const { srcDir, destPrefix } of sources) {
    if (!fs.existsSync(srcDir)) continue;
    for (const rel of collectFiles(srcDir)) {
      const dest = destPrefix ? path.join(destPrefix, rel) : rel;
      items.push({ src: path.join(srcDir, rel), dest });
    }
  }
  return items;
}

export function parseAdapterList(raw: string | undefined): string[] {
  if (!raw) return [];

  const adapters = raw
    .split(',')
    .map((tool) => tool.trim().toLowerCase())
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

export function resolveTarget(raw: string): string {
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

export function exists(dest: string, targetDir: string): boolean {
  return fs.existsSync(path.join(targetDir, dest));
}

export function copyItem(item: InstallItem, targetDir: string): void {
  const destPath = path.join(targetDir, item.dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(item.src, destPath);
}

export function hasAnyPath(targetDir: string, paths: string[]): boolean {
  return paths.some((rel) => exists(rel, targetDir));
}

// Checks core files (always) + one key file per selected adapter.
export function validate(adapters: string[], targetDir: string): string[] {
  const failures: string[] = [];

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

export function detectDefaultAdapters(targetDir: string): string[] {
  if (fs.existsSync(path.join(targetDir, DEFAULT_CURSOR_MARKER))) {
    return ['cursor'];
  }
  if (fs.existsSync(path.join(targetDir, DEFAULT_CLAUDE_MARKER))) {
    return ['claude'];
  }
  return ['generic'];
}

export interface ResolveAdaptersOptions {
  adapters?: string;
  adapter?: string;
  tool?: string;
}

export function resolveAdapters(options: ResolveAdaptersOptions, targetDir: string): string[] {
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

export { isManaged };
