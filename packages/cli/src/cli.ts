import meow from "meow";
import * as z from "zod";
import { createPrismicManager } from "@prismicio/manager";

import { name as pkgName, version as pkgVersion } from "../package.json";
import { setupSentry, trackSentryError } from "./utils/sentry";
import { displayError, displayHeader } from "./utils/output";
import { init } from "./commands/init";
import { sync } from "./commands/sync";
import { initTelemetry, trackErrorTelemetry } from "./utils/telemetry";
import { FRAMEWORK_PLUGINS } from "./core/framework";
import { handleSilentError } from "./utils/error";

const cli = meow(
	`
DOCUMENTATION
  https://prismic.io/docs

VERSION
  ${pkgName}@${pkgVersion}

USAGE
  $ npx prismic@latest init --repository <repository-id>
  $ npx prismic@latest sync

OPTIONS
  --repository, -r        Specify a Prismic repository to use when initializing a project

  --help, -h              Display CLI help
  --version, -v           Display CLI version
`,
	{
		importMeta: import.meta,
		flags: {
			repository: {
				type: "string",
				shortFlag: "r",
			},
			help: {
				type: "boolean",
				shortFlag: "h",
				default: false,
			},
			version: {
				type: "boolean",
				shortFlag: "v",
				default: false,
			},
		},
		description: false,
		autoHelp: false,
		autoVersion: false,
		allowUnknownFlags: false,
	},
);

export const CLIArgs = z.discriminatedUnion("commandType", [
	z.object({
		commandType: z.literal("init"),
		help: z.boolean().optional(),
		version: z.boolean().optional(),
		repository: z
			.string()
			.min(1, "Repository name is required to initialize a project"),
	}),
	z.object({
		commandType: z.literal("sync"),
		help: z.boolean().optional(),
		version: z.boolean().optional(),
	}),
]);

export async function run(): Promise<void> {
	// Display header immediately so user sees something is happening
	displayHeader();

	// Setup Sentry as early as possible to track ALL errors
	setupSentry();

	// Handle help flag (exit early, no telemetry needed)
	if (cli.flags.help) {
		cli.showHelp(0);
		process.exit(0);
	}

	// Handle version flag (exit early, no telemetry needed)
	if (cli.flags.version) {
		console.info(`${pkgName}@${pkgVersion}`);
		process.exit(0);
	}

	// Validate CLI arguments first (before any operations that might fail)
	const cliArgs = CLIArgs.safeParse({
		...cli.flags,
		commandType: cli.input[0],
	});

	// Invalid arguments - track with Sentry even though it's a user error
	if (!cliArgs.success) {
		const error = new Error(cliArgs.error.message);
		displayError(error);
		await trackSentryError(error);
		process.exit(1);
	}

	// Too many arguments - track with Sentry
	if (cli.input.length > 1) {
		const error = new Error("Too many arguments. Expected 'init' or 'sync'.");
		displayError(error);
		await trackSentryError(error);
		process.exit(1);
	}

	// Create manager - wrap in try-catch to track failures
	let manager;
	try {
		manager = createPrismicManager({
			cwd: process.cwd(),
			nativePlugins: FRAMEWORK_PLUGINS,
		});
	} catch (error) {
		// Manager creation failed - track with Sentry (telemetry not available yet)
		displayError(error);
		await trackSentryError(error);
		process.exit(1);
	}

	const commandType = cliArgs.data.commandType;
	const repositoryName =
		commandType === "init" ? cliArgs.data.repository : undefined;

	// Initialize telemetry as early as possible (after manager creation)
	// Track initialization failures with Sentry
	try {
		await initTelemetry({
			manager,
			commandType,
			repositoryName,
		});
	} catch (telemetryError) {
		// Telemetry initialization failed - track with Sentry but continue execution
		// This prevents telemetry issues from breaking the CLI
		await trackSentryError(telemetryError);
		handleSilentError(telemetryError, "Telemetry initialization error");
	}

	// Execute command - all errors here will be tracked
	try {
		if (commandType === "init") {
			await init({
				manager,
				repositoryName: cliArgs.data.repository,
			});
			process.exit(0);
		}

		if (commandType === "sync") {
			await sync({ manager });
			process.exit(0);
		}

		throw new Error("Unknown command type.");
	} catch (error) {
		displayError(error);

		// Always track with Sentry first (most reliable)
		await trackSentryError(error);

		// Try to track with telemetry if it was initialized
		// If telemetry wasn't initialized or tracking fails, Sentry already has it
		try {
			await trackErrorTelemetry({
				manager,
				error,
				commandType,
			});
		} catch (telemetryError) {
			handleSilentError(telemetryError, "Telemetry tracking error");
		}

		process.exit(1);
	}
}

void run();
