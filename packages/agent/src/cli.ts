import { createSliceMachineManager } from "@slicemachine/manager";
import chalk from "chalk";
import { generateTypes } from "./generateTypes";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";

interface CLIOptions {
  help?: boolean;
  verbose: boolean;
  repository?: string;
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
      case "-h":
      case "--help":
        options.help = true;
        break;

      case "-v":
      case "--verbose":
        options.verbose = true;
        break;

      case "-r":
      case "--repository":
        options.repository = args[++i];
        break;

      case "-e":
      case "--environment":
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

Headless CLI agent for syncing Prismic models and generating TypeScript types.

${chalk.bold("Usage:")}
  slicemachine-agent [options]
  sm-agent [options]

${chalk.bold("Options:")}
  -r, --repository <name>    Prismic repository name (required)
  -e, --environment <env>    Prismic environment (default: production)
                             Options: production, staging, dev-tools, 
                             marketing-tools, platform, development
  -v, --verbose              Show detailed output
  -h, --help                 Show this help message

${chalk.bold("Environment Variables:")}
  PRISMIC_REPOSITORY         Alternative to --repository flag
  SM_ENV                     Alternative to --environment flag

${chalk.bold("Examples:")}
  # Sync models and generate types for a repository
  sm-agent --repository my-repo

  # Run with verbose output
  sm-agent -r my-repo -v

  # Use a specific Prismic environment
  sm-agent -r my-repo -e staging

  # Use environment variable
  PRISMIC_REPOSITORY=my-repo sm-agent

  # Combine with SM_ENV
  SM_ENV=staging sm-agent -r my-repo

  # Use in CI/CD
  npx @slicemachine/agent -r my-repo -v

${chalk.bold("Authentication:")}
  This CLI uses the same authentication as other Prismic tools.
  Run 'npx prismic login' to authenticate.

${chalk.bold("Output:")}
  Types are always written to: prismicio-types.d.ts
  The file is automatically formatted with Prettier.
`);
}

async function getRepositoryName(options: CLIOptions): Promise<string> {
  // Priority: CLI arg > env var
  if (options.repository) {
    return options.repository;
  }

  if (process.env.PRISMIC_REPOSITORY) {
    return process.env.PRISMIC_REPOSITORY;
  }

  throw new Error(
    "No repository specified. Use --repository or set PRISMIC_REPOSITORY env var",
  );
}

export async function runCLI(): Promise<void> {
  let temporaryConfigCreated = false;
  const configPath = join(process.cwd(), "slicemachine.config.json");

  try {
    const options = await parseArgs();

    if (options.help) {
      await showHelp();
      return;
    }

    // Check if repository is provided
    if (!options.repository && !process.env.PRISMIC_REPOSITORY) {
      console.error(
        chalk.red(
          "❌ Error: No repository specified. Use --repository or set PRISMIC_REPOSITORY env var",
        ),
      );
      console.log("");
      await showHelp();
      process.exit(1);
    }

    if (options.verbose) {
      console.log(chalk.blue("🤖 Slice Machine Agent"));
    }

    const repositoryName = await getRepositoryName(options);

    if (options.verbose) {
      console.log(chalk.gray(`📦 Repository: ${repositoryName}`));
      if (options.environment) {
        console.log(
          chalk.gray(`🌍 Prismic Environment: ${options.environment}`),
        );
      }
    }

    // Set SM_ENV for Prismic environment if specified
    if (options.environment) {
      process.env.SM_ENV = options.environment;
    }

    // Check if slicemachine.config.json exists, create temporary if needed
    try {
      await readFile(configPath, "utf8");
    } catch {
      // Create temporary config for manager
      const tempConfig = {
        repositoryName,
        adapter: "@slicemachine/adapter-next",
        libraries: [],
      };
      await writeFile(configPath, JSON.stringify(tempConfig, null, 2));
      temporaryConfigCreated = true;

      if (options.verbose) {
        console.log(
          chalk.gray("📝 Created temporary slicemachine.config.json"),
        );
      }
    }

    if (options.verbose) {
      console.log(chalk.gray("🔐 Creating Slice Machine manager..."));
    }

    const manager = createSliceMachineManager({
      cwd: process.cwd(),
    });

    if (options.verbose) {
      console.log(chalk.gray("🔌 Initializing plugins..."));
    }

    // Initialize plugins - this will fail to load the adapter since it's not installed,
    // but the initialization flag will be set which is required by the manager.
    // We catch the error since we don't actually need the adapter - we only use
    // the manager's API methods which don't require plugin hooks.
    try {
      await manager.plugins.initPlugins();
    } catch (error) {
      // Expected error: adapter package not found. This is fine - we don't need it.
      if (options.verbose) {
        console.log(
          chalk.gray(
            "⚠️  Plugin initialization incomplete (adapter not needed for remote operations)",
          ),
        );
      }
    }

    if (options.verbose) {
      console.log(chalk.gray("✅ Manager created successfully"));
    }

    await generateTypes({
      manager,
      outputPath: "prismicio-types.d.ts",
      verbose: options.verbose,
    });

    // Clean up temporary config
    if (temporaryConfigCreated) {
      await unlink(configPath);
      if (options.verbose) {
        console.log(
          chalk.gray("🧹 Cleaned up temporary slicemachine.config.json"),
        );
      }
    }
  } catch (error) {
    // Clean up temporary config on error
    if (temporaryConfigCreated) {
      try {
        await unlink(configPath);
      } catch {
        // Ignore cleanup errors
      }
    }

    console.error(
      chalk.red("❌ Error:"),
      error instanceof Error ? error.message : String(error),
    );

    if (error instanceof Error && error.stack) {
      console.error(chalk.red("Stack:"), error.stack);
    }

    process.exit(1);
  }
}
