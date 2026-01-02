import { createSliceMachineManager } from "@slicemachine/manager";
import chalk from "chalk";
import { generateTypes } from "./generateTypes";

// Helpers
import { detectEnvironment } from "./lib/detectEnvironment";
import { ensureAuthenticated } from "./lib/auth";
import { selectRepository } from "./lib/repository";
import { checkProjectInitialized, writeSliceMachineConfig } from "./lib/config";
import { installDependencies } from "./lib/installDependencies";

// Creating files
import { upsertPrismicFile } from "./lib/create/prismicio";
import { createAPIRoutes } from "./lib/create/apiRoutes";
import { createSliceSimulator } from "./lib/create/sliceSimulator";
import {
  createSliceComponents,
  updateSliceLibraryIndex,
} from "./lib/create/slices";
import { createPageComponents } from "./lib/create/pages";

interface CLIOptions {
  help?: boolean;
  verbose: boolean;
  environment?: string;
}

async function parseArgs(): Promise<CLIOptions> {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--verbose":
      case "-v":
        options.verbose = true;
        break;
      case "--environment":
      case "-e":
        options.environment = args[++i];
        break;
      default:
        console.error(chalk.red(`❌ Unknown option: ${arg}`));
        process.exit(1);
    }
  }

  return options;
}

async function showHelp(): Promise<void> {
  console.log(`
${chalk.bold("Slice Machine Agent")}

Headless CLI agent for initializing and syncing Prismic projects.

${chalk.bold("Usage:")}
  slicemachine-agent [options]
  sm-agent [options]

${chalk.bold("Options:")}
  -e, --environment <env>    Prismic environment (default: production)
                             Options: production, staging, dev-tools, 
                             marketing-tools, platform, development
  -v, --verbose              Show detailed output
  -h, --help                 Show this help message

${chalk.bold("Environment Variables:")}
  SM_ENV                     Alternative to --environment flag

${chalk.bold("Examples:")}
  # Initialize a new project or sync an existing one
  sm-agent

  # Run with verbose output
  sm-agent -v

  # Use a specific Prismic environment
  sm-agent -e staging

  # Use environment variable
  SM_ENV=staging sm-agent

${chalk.bold("Authentication:")}
  This CLI uses the same authentication as other Prismic tools.
  On first run, you'll be prompted to login via your browser.

${chalk.bold("What it does:")}
  First run (project not configured):
    1. Detects your Next.js environment
    2. Authenticates you with Prismic
    3. Lets you select a repository
    4. Installs Prismic dependencies
    5. Creates configuration and core files
    6. Creates slices and pages from your remote Prismic models
    7. Generates TypeScript types

  Subsequent runs (project already configured):
    1. Fetches remote models
    2. Creates any new slices/pages (skips existing)
    3. Regenerates TypeScript types
`);
}

export async function runCLI(): Promise<void> {
  try {
    const options = await parseArgs();

    if (options.help) {
      await showHelp();
      return;
    }

    const cwd = process.cwd();

    console.log(chalk.blue("\n🤖 Slice Machine Agent\n"));

    // Set SM_ENV for Prismic environment if specified
    if (options.environment) {
      process.env.SM_ENV = options.environment;
      if (options.verbose) {
        console.log(
          chalk.gray(`🌍 Prismic Environment: ${options.environment}`),
        );
      }
    }

    if (options.verbose) {
      console.log(chalk.gray("📦 Detecting Next.js environment..."));
    }
    const env = await detectEnvironment(cwd);

    if (options.verbose) {
      console.log(
        chalk.gray(
          `✅ Detected: ${env.hasAppRouter ? "App Router" : "Pages Router"}, ${
            env.isTypeScript ? "TypeScript" : "JavaScript"
          }${env.hasSrcDirectory ? ", src/ directory" : ""}`,
        ),
      );
      console.log(
        chalk.gray(`✅ Package manager: ${chalk.cyan(env.packageManager)}`),
      );
    }

    const isInitialized = await checkProjectInitialized(cwd);

    const manager = createSliceMachineManager({ cwd });

    if (!isInitialized) {
      if (options.verbose) {
        console.log(chalk.gray("🆕 New project detected"));
      }
      await runInitPhase(cwd, manager, env, options.verbose);
    } else if (options.verbose) {
      console.log(chalk.gray("📦 Project already configured"));
    }

    await runSyncPhase(cwd, manager, env, options.verbose);

    console.log(chalk.green("\n✅ All done!\n"));
  } catch (error) {
    console.error(
      chalk.red("\n❌ Error:"),
      error instanceof Error ? error.message : String(error),
    );

    if (error instanceof Error && error.stack && process.env.DEBUG) {
      console.error(chalk.red("Stack:"), error.stack);
    }

    process.exit(1);
  }
}

async function runInitPhase(
  cwd: string,
  manager: ReturnType<typeof createSliceMachineManager>,
  env: Awaited<ReturnType<typeof detectEnvironment>>,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(chalk.bold("\n📋 Configuring Prismic repository...\n"));
  }

  // 1. Authenticate
  await ensureAuthenticated(manager, verbose);

  // 2. Select repository
  const repository = await selectRepository(manager, verbose);

  // 3. Install dependencies
  await installDependencies(env.packageManager, verbose);

  // 4. Create core files
  await createAPIRoutes(cwd, env, verbose);
  await createSliceSimulator(cwd, env, verbose);

  // 5. Create slicemachine.config.json
  const libraryPath = env.hasSrcDirectory ? "./src/slices" : "./slices";
  await writeSliceMachineConfig(cwd, {
    repositoryName: repository.domain,
    adapter: "@slicemachine/adapter-next",
    libraries: [libraryPath],
    localSliceSimulatorURL: "http://localhost:3000/slice-simulator",
    agentInitialized: true,
  });

  if (verbose) {
    console.log(chalk.green("✅ Created slicemachine.config.json"));
  }
}

async function runSyncPhase(
  cwd: string,
  manager: ReturnType<typeof createSliceMachineManager>,
  env: Awaited<ReturnType<typeof detectEnvironment>>,
  verbose: boolean,
): Promise<void> {
  if (verbose) {
    console.log(chalk.bold("\n📋 Syncing pages and slices...\n"));
  }

  // Initialize plugins
  await manager.plugins.initPlugins();

  // 1. Fetch models from Prismic in parallel
  const [customTypes, slices] = await Promise.all([
    manager.customTypes.fetchRemoteCustomTypes(),
    manager.slices.fetchRemoteSlices(),
  ]);

  if (verbose) {
    console.log(
      chalk.gray(
        `✅ Found ${customTypes.length} ${
          customTypes.length === 1 ? "custom type" : "custom types"
        }, ${slices.length} ${slices.length === 1 ? "slice" : "slices"}`,
      ),
    );
  }

  // 2. Generate TypeScript types (only for TypeScript projects)
  if (env.isTypeScript) {
    await generateTypes({
      manager,
      outputPath: "prismicio-types.d.ts",
      verbose: false, // Don't show individual type output
    });

    if (verbose) {
      console.log(chalk.green("✅ Generated TypeScript types"));
    }
  }

  // 3. Create slice components
  const sliceResults = await createSliceComponents(cwd, env, slices, verbose);

  // 4. Update slice library index (only if there are slices)
  if (sliceResults.created > 0) {
    await updateSliceLibraryIndex(cwd, env, slices, verbose);
  }

  // 5. Create page components
  const pageResults = await createPageComponents(
    cwd,
    env,
    customTypes,
    verbose,
  );

  // 6. Create prismicio.ts
  await upsertPrismicFile(
    cwd,
    env,
    customTypes,
    pageResults.created > 0,
    verbose,
  );
}
