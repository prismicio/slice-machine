import meow from "meow";
import chalk from "chalk";
import * as z from "zod";

import { name as pkgName, version as pkgVersion } from "../package.json";
import { setupSentry, trackSentryError } from "./utils/sentry";
import { displayError, displayHeader } from "./utils/output";
import { init } from "./commands/init";
import { sync } from "./commands/sync";

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

const RunArgs = z.discriminatedUnion("command", [
	z.object({
		command: z.literal("init"),
		help: z.boolean().optional(),
		version: z.boolean().optional(),
		repository: z
			.string()
			.min(1, "Repository name is required to initialize a project"),
	}),
	z.object({
		command: z.literal("sync"),
		help: z.boolean().optional(),
		version: z.boolean().optional(),
	}),
]);

export async function run(): Promise<void> {
	try {
		// Directly display the header so the user see something is happening
		displayHeader();

		// Setup sentry as early as possible to track errors
		setupSentry();

		// Help command
		if (cli.flags.help) {
			cli.showHelp(0);
			process.exit(0);
		}

		// Version command
		if (cli.flags.version) {
			console.info(`${pkgName}@${pkgVersion}`);
			process.exit(0);
		}

		// Validate CLI arguments
		const args = RunArgs.safeParse({
			...cli.flags,
			command: cli.input[0],
		});

		// Invalid arguments
		if (!args.success) {
			console.error(chalk.red(args.error.message));
			process.exit(1);
		}

		// Too many arguments
		if (cli.input.length > 1) {
			console.error(
				chalk.red("Too many arguments. Expected 'init' or 'sync'."),
			);
			process.exit(1);
		}

		// Init command
		if (args.data.command === "init") {
			await init({
				repositoryName: args.data.repository,
			});
			process.exit(0);
		}

		// Sync command
		if (args.data.command === "sync") {
			await sync();
			process.exit(0);
		}

		// Unknown command
		throw new Error("Unknown command.");
	} catch (error) {
		displayError(error);
		await trackSentryError(error);
		process.exit(1);
	}
}

void run();
