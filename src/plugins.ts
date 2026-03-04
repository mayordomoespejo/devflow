import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
import { PLUGINS_FILE } from './constants';
import { PluginManifest, InstalledPlugin, PluginsFile } from './types';
import { collectFiles } from './install';

// ─── plugins.yml I/O ────────────────────────────────────────────────────────

export function readPluginsFile(targetDir: string): PluginsFile {
  const filePath = path.join(targetDir, PLUGINS_FILE);
  if (!fs.existsSync(filePath)) {
    return { plugins: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return { plugins: [] };

  // Minimal YAML parser for our simple format (no dependency required)
  const plugins: InstalledPlugin[] = [];
  let current: Partial<InstalledPlugin> | null = null;

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (trimmed === 'plugins:') continue;
    if (trimmed.startsWith('- name:')) {
      if (current) plugins.push(current as InstalledPlugin);
      current = { name: trimmed.replace('- name:', '').trim() };
    } else if (current && trimmed.startsWith('source:')) {
      current.source = trimmed.replace('source:', '').trim();
    } else if (current && trimmed.startsWith('version:')) {
      current.version = trimmed.replace('version:', '').trim();
    } else if (current && trimmed.startsWith('destDir:')) {
      current.destDir = trimmed.replace('destDir:', '').trim();
    } else if (current && trimmed.startsWith('keyFile:')) {
      current.keyFile = trimmed.replace('keyFile:', '').trim();
    }
  }
  if (current) plugins.push(current as InstalledPlugin);

  return { plugins };
}

export function writePluginsFile(targetDir: string, data: PluginsFile): void {
  const filePath = path.join(targetDir, PLUGINS_FILE);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const lines = ['plugins:'];
  for (const p of data.plugins) {
    lines.push(`  - name: ${p.name}`);
    lines.push(`    source: ${p.source}`);
    lines.push(`    version: ${p.version}`);
    lines.push(`    destDir: ${p.destDir}`);
    lines.push(`    keyFile: ${p.keyFile}`);
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

// ─── source resolution ───────────────────────────────────────────────────────

export function isNpmPackage(source: string): boolean {
  // Not a path — doesn't start with . / ~
  return !source.startsWith('.') && !source.startsWith('/') && !source.startsWith('~');
}

export function resolvePluginSource(source: string): { pluginDir: string; cleanup: (() => void) | null } {
  if (!isNpmPackage(source)) {
    // Local path
    const resolved = path.resolve(source);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: plugin source does not exist: ${resolved}`);
      process.exit(1);
    }
    return { pluginDir: resolved, cleanup: null };
  }

  // npm package — install into temp dir
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'devflow-plugin-'));
  try {
    console.log(`  …  fetching ${source} from npm`);
    execSync(`npm install --prefix "${tmp}" "${source}" --no-save --silent`, { stdio: 'pipe' });
  } catch (err: unknown) {
    fs.rmSync(tmp, { recursive: true, force: true });
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: failed to install npm package "${source}".\n${msg}`);
    process.exit(1);
  }

  // Resolve the package name (strip scope for directory lookup)
  const pkgName = source.split('@').filter(Boolean)[0];
  const pluginDir = path.join(tmp, 'node_modules', pkgName);

  if (!fs.existsSync(pluginDir)) {
    fs.rmSync(tmp, { recursive: true, force: true });
    console.error(`Error: could not locate package "${pkgName}" after install.`);
    process.exit(1);
  }

  return {
    pluginDir,
    cleanup: () => fs.rmSync(tmp, { recursive: true, force: true }),
  };
}

// ─── manifest loading ────────────────────────────────────────────────────────

export function loadPluginManifest(pluginDir: string): PluginManifest {
  const manifestPath = path.join(pluginDir, 'devflow-plugin.json');
  if (!fs.existsSync(manifestPath)) {
    console.error(`Error: no devflow-plugin.json found in ${pluginDir}`);
    console.error('       Every Devflow plugin must have a devflow-plugin.json manifest.');
    process.exit(1);
  }

  let manifest: PluginManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    console.error(`Error: devflow-plugin.json in ${pluginDir} is not valid JSON.`);
    process.exit(1);
  }

  if (!manifest.name || typeof manifest.name !== 'string') {
    console.error('Error: devflow-plugin.json must have a "name" string field.');
    process.exit(1);
  }
  if (!manifest.version || typeof manifest.version !== 'string') {
    console.error('Error: devflow-plugin.json must have a "version" string field.');
    process.exit(1);
  }

  return manifest;
}

// ─── install helpers ─────────────────────────────────────────────────────────

export function resolvePluginPaths(manifest: PluginManifest): { destDir: string; keyFile: string } {
  const destDir = manifest.destDir ?? path.join('.devflow', 'plugins', manifest.name);
  const keyFile = manifest.keyFile ?? path.join(destDir, 'README.md');
  return { destDir, keyFile };
}

export function buildPluginInstallList(
  pluginDir: string,
): Array<{ src: string; dest: string }> {
  const templatesDir = path.join(pluginDir, 'templates');
  if (!fs.existsSync(templatesDir)) {
    console.error(`Error: plugin has no templates/ directory in ${pluginDir}`);
    process.exit(1);
  }

  // templates/ mirrors the project root layout — each file's relative path
  // is its destination path in the target project.
  return collectFiles(templatesDir).map((rel) => ({
    src: path.join(templatesDir, rel),
    dest: rel,
  }));
}
