#!/usr/bin/env node

// Slice Machine is deprecated. This bin prints the redirect message on every
// invocation (including `--help` and `--version`) and exits with code 1. The
// rest of the package is no longer reachable from the command line.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The manager's CommonJS build is the one Node can load outside a bundler.
const require = createRequire(import.meta.url);
const { createSliceMachineManager } = require("@slicemachine/manager");

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf8"),
);

const repository = readRepositoryFlag(process.argv.slice(2));
const initCommand = repository
	? `npx prismic init --repo ${repository}`
	: "npx prismic init";

process.stderr.write(
	`Slice Machine is deprecated and no longer creates new projects.

New Prismic projects use the Type Builder and the Prismic CLI:

  ${initCommand}

Using an AI agent? Install the Prismic skill so it uses the CLI:

  npx skills add --global --yes prismicio/skills

Docs: https://prismic.io/docs/cli
Existing Slice Machine projects: https://prismic.io/docs/slice-machine
`,
);

await trackHalt(repository);

process.exit(1);

/**
 * Returns the value of `--repository` / `-r`, the flag the init CLI used to
 * accept, so the suggested command can carry it as `--repo`.
 */
function readRepositoryFlag(argv) {
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];

		const match = arg.match(/^(?:--repository|-r)(?:=(.*))?$/);
		if (!match) {
			continue;
		}

		const value = match[1] !== undefined ? match[1] : argv[i + 1];
		if (value && !value.startsWith("-")) {
			return value;
		}
	}
}

/**
 * Counts halted runs with Slice Machine's existing telemetry. Respects the
 * `.prismicrc` telemetry setting and never delays the exit by more than a few
 * seconds.
 */
async function trackHalt(repository) {
	try {
		const manager = createSliceMachineManager();
		await manager.telemetry.initTelemetry({
			appName: pkg.name,
			appVersion: pkg.version,
		});

		await Promise.race([
			manager.telemetry.track({
				event: "command:init:deprecation-halt",
				repository,
			}),
			new Promise((resolve) => setTimeout(resolve, 3000)),
		]);
	} catch {
		// Telemetry must never block the message.
	}
}
