import meow from "meow";
import chalk from "chalk";
import * as z from "zod";
import { createPrismicManager } from "@prismicio/manager";
import adapterNextPlugin from "@prismicio/adapter-next";
import adapterNuxtPlugin from "@prismicio/adapter-nuxt";
import adapterNuxt2Plugin from "@prismicio/adapter-nuxt2";
import adapterSveltekitPlugin from "@prismicio/adapter-sveltekit";

import { name as pkgName, version as pkgVersion } from "../package.json";
import { login } from "./core/auth";
import { init } from "./commands/init";
import { sync } from "./commands/sync";
import { warnIfUnsupportedNode } from "./utils/node";
import { setupSentry, trackSentryError } from "./utils/sentry";
import { displayError, displayHeader, displaySuccess } from "./utils/output";

const cli = meow(
	`
DOCUMENTATION
  https://prismic.io/docs

VERSION
  ${pkgName}@${pkgVersion}

USAGE
  $ npx prismic init --repository <repository-id>
  $ npx prismic sync

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

export async function run(): Promise<void> {
	try {
		// Directly display the header so the user see something is happening
		displayHeader();

		// Setup sentry as early as possible to track errors
		setupSentry();

		// Warn early if Node.js version is unsupported
		warnIfUnsupportedNode();

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

		// Parse arguments
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

		// Authentication
		const manager = createPrismicManager({
			cwd: process.cwd(),
			nativePlugins: {
				"@prismicio/adapter-next": adapterNextPlugin,
				"@prismicio/adapter-nuxt": adapterNuxtPlugin,
				"@prismicio/adapter-nuxt2": adapterNuxt2Plugin,
				"@prismicio/adapter-sveltekit": adapterSveltekitPlugin,
			},
		});
		await login(manager);

		// Init command
		if (args.data.command === "init") {
			await init({
				manager,
				repositoryName: args.data.repository,
			});

			displaySuccess(
				"Project initialized successfully!",
				"You're all set to start building with Prismic.",
			);
			process.exit(0);
		}

		// Sync command
		if (args.data.command === "sync") {
			await sync({
				manager,
			});

			displaySuccess(
				"Sync completed successfully!",
				"Your local types are up to date.",
			);
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
