import * as fs from 'fs';
import * as path from 'path';
import { resolveTarget, exists, copyItem, isManaged } from '../install';
import {
  readPluginsFile, writePluginsFile,
  resolvePluginSource, loadPluginManifest,
  resolvePluginPaths, buildPluginInstallList,
} from '../plugins';

type AddOptions = {
  target?: string;
  force?: boolean;
  dryRun?: boolean;
};

export function runAdd(source: string, options: AddOptions): void {
  const targetDir = resolveTarget(options.target ?? process.cwd());
  const dryRun    = Boolean(options.dryRun);
  const force     = Boolean(options.force);

  // Resolve source → local plugin directory
  const { pluginDir, cleanup } = resolvePluginSource(source);

  try {
    const manifest = loadPluginManifest(pluginDir);
    const { destDir, keyFile } = resolvePluginPaths(manifest);

    // Check if already installed (unless --force)
    const pluginsData  = readPluginsFile(targetDir);
    const alreadyIndex = pluginsData.plugins.findIndex((p) => p.name === manifest.name);
    const alreadyInstalled = alreadyIndex !== -1;

    if (alreadyInstalled && !force) {
      console.log(`Plugin "${manifest.name}" is already installed. Use --force to reinstall.`);
      return;
    }

    // Build install list
    const items = buildPluginInstallList(pluginDir);

    if (items.length === 0) {
      console.error(`Error: plugin "${manifest.name}" has no files to install.`);
      process.exit(1);
    }

    if (dryRun) {
      const action = alreadyInstalled ? 'reinstall' : 'install';
      console.log(`Devflow: dry run — ${action} plugin "${manifest.name}" into ${targetDir}`);
      for (const { dest } of items) {
        const fileExists = exists(dest, targetDir);
        const tag = !fileExists ? '[create]   ' : force ? '[overwrite]' : '[skip]     ';
        console.log(`  ${tag}  ${dest}`);
      }
      console.log('\nDry run complete. Run without --dry-run to apply.');
      return;
    }

    const action = alreadyInstalled ? 'reinstalling' : 'installing';
    console.log(`Devflow: ${action} plugin "${manifest.name}" into ${targetDir}\n`);

    for (const item of items) {
      const existed = exists(item.dest, targetDir);
      // Safety: never overwrite files outside Devflow-managed paths without --force
      if (existed && !force && !isManaged(item.dest)) {
        console.log(`  –  ${item.dest} (skipped – not Devflow-managed)`);
        continue;
      }
      try {
        copyItem(item, targetDir);
        const suffix = existed ? ' (overwritten)' : '';
        console.log(`  ✓  ${item.dest}${suffix}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  ✗  ${item.dest}  →  ${msg}`);
        process.exit(1);
      }
    }

    // Update plugins.yml
    const entry = {
      name:    manifest.name,
      source,
      version: manifest.version,
      destDir,
      keyFile,
    };

    if (alreadyInstalled) {
      pluginsData.plugins[alreadyIndex] = entry;
    } else {
      pluginsData.plugins.push(entry);
    }
    writePluginsFile(targetDir, pluginsData);

    console.log(`\nPlugin "${manifest.name}" installed. Recorded in .devflow/plugins.yml`);
  } finally {
    cleanup?.();
  }
}

type RemoveOptions = {
  target?: string;
  force?: boolean;
};

export function runRemove(name: string, options: RemoveOptions): void {
  const targetDir = resolveTarget(options.target ?? process.cwd());
  const pluginsData = readPluginsFile(targetDir);

  const index = pluginsData.plugins.findIndex((p) => p.name === name);
  if (index === -1) {
    console.error(`Error: plugin "${name}" is not recorded in .devflow/plugins.yml`);
    process.exit(1);
  }

  const plugin = pluginsData.plugins[index];
  const pluginDestDir = path.join(targetDir, plugin.destDir);

  if (fs.existsSync(pluginDestDir)) {
    fs.rmSync(pluginDestDir, { recursive: true, force: true });
    console.log(`Removed: ${plugin.destDir}`);
  } else {
    console.log(`Note: ${plugin.destDir} was not found on disk (already removed)`);
  }

  pluginsData.plugins.splice(index, 1);
  writePluginsFile(targetDir, pluginsData);

  console.log(`Plugin "${name}" removed from .devflow/plugins.yml`);
}
