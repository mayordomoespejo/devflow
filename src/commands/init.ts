import { buildInstallList, resolveTarget, exists, copyItem, validate, resolveAdapters, isManaged } from '../install';
import { ResolveAdaptersOptions } from '../install';

type InitOptions = ResolveAdaptersOptions & {
  target?: string;
  dryRun?: boolean;
  force?: boolean;
  merge?: boolean;
};

export function runInit(options: InitOptions): void {
  const targetDir = resolveTarget(options.target ?? process.cwd());
  const dryRun   = Boolean(options.dryRun);
  const force    = Boolean(options.force);
  const merge    = Boolean(options.merge) && !force; // force wins over merge
  const adapters = resolveAdapters(options, targetDir);

  let items;
  try {
    items = buildInstallList(adapters);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Error: could not read templates.\n${msg}`);
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
    const modeLabel   = force ? ' --force' : merge ? ' --merge' : '';
    const installLabel = adapters.length > 0 ? `core + ${adapters.join(', ')}` : 'core only';
    console.log(`Devflow: dry run — target: ${targetDir}${modeLabel}`);
    console.log(`Install set: ${installLabel}\n`);
    for (const { dest } of items) {
      const fileExists = exists(dest, targetDir);
      let tag: string;
      if (!fileExists)           tag = '[create]   ';
      else if (!isManaged(dest)) tag = '[skip]     '; // never touch non-managed files
      else if (force)            tag = '[overwrite]';
      else if (merge)            tag = '[skip]     ';
      else                       tag = '[conflict] ';
      console.log(`  ${tag}  ${dest}`);
    }
    if (!force && !merge && conflicts.length > 0) {
      console.log('\n  Tip: use --force to overwrite or --merge to skip conflicts.');
    }
    console.log('\nDry run complete. Run without --dry-run to apply.');
    return;
  }

  const modeLabel   = force ? ' (force)' : merge ? ' (merge)' : '';
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗  ${item.dest}  →  ${msg}`);
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
