import { program } from 'commander';
import { ALL_ADAPTERS } from './constants';
import { runInit } from './commands/init';
import { runDoctor } from './commands/doctor';
import { runExplain } from './commands/explain';
import { runAdd, runRemove } from './commands/add';

const pkg = require('../package.json') as { version: string };

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
    `single adapter: ${ALL_ADAPTERS.join(', ')}, none (default: cursor if .cursor exists, claude if .claude exists, otherwise generic)`,
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

program
  .command('add <source>')
  .description('Install a Devflow plugin from a local path or npm package')
  .option('-f, --force', 'reinstall even if the plugin is already present')
  .option('-n, --dry-run', 'preview operations without writing')
  .option('-t, --target <path>', 'install into a different directory', process.cwd())
  .action(runAdd);

program
  .command('remove <name>')
  .description('Remove an installed Devflow plugin')
  .option('-t, --target <path>', 'target directory containing the plugin', process.cwd())
  .action(runRemove);

program.parse(process.argv);
