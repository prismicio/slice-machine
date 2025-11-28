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

// Warn early if Node.js version is unsupported
warnIfUnsupportedNode();

const cli = meow(
	`
Prismic CLI help

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
				alias: "r",
			},
			help: {
				type: "boolean",
				alias: "h",
				default: false,
			},
			version: {
				type: "boolean",
				alias: "v",
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
export type RunArgs = z.TypeOf<typeof RunArgs>;

if (cli.flags.help) {
	cli.showHelp(0);
} else if (cli.flags.version) {
	console.info(`${pkgName}@${pkgVersion}`);
	process.exit(0);
} else {
	const args = RunArgs.safeParse({
		...cli.flags,
		command: cli.input[0],
	});

	if (!args.success) {
		console.error(chalk.red(args.error.message));
		process.exit(1);
	}

	if (cli.input.length > 1) {
		console.error(chalk.red("Too many arguments. Expected 'init' or 'sync'."));
		process.exit(1);
	}

	run(args.data);
}

export async function run(args: RunArgs): Promise<void> {
	try {
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

		if (args.command === "init") {
			await init({
				manager,
				repositoryName: args.repository,
			});
		} else if (args.command === "sync") {
			await sync({
				manager,
			});
		}
		process.exit(0);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}
