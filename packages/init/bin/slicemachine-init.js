#!/usr/bin/env node

// Slice Machine is deprecated: every run prints the redirect and exits 1.

import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { parseArgs } from "node:util";

// The manager's ES build has directory imports Node rejects; use CommonJS.
const require = createRequire(import.meta.url);
const { createSliceMachineManager } = require("@slicemachine/manager");
const pkg = require("../package.json");

const { values } = parseArgs({
	args: process.argv.slice(2),
	options: { repository: { type: "string", short: "r" } },
	strict: false,
	allowPositionals: true,
});
// The previous parser also accepted `-r=<name>`.
const repository =
	typeof values.repository === "string"
		? values.repository.replace(/^=/, "")
		: undefined;

process.stderr.write(
	`Slice Machine is deprecated and no longer creates new projects.

New Prismic projects use the Type Builder and the Prismic CLI:

  ${repository ? `npx prismic init --repo ${repository}` : "npx prismic init"}

Using an AI agent? Install the Prismic skill so it uses the CLI:

  npx skills add --global --yes prismicio/skills

Docs: https://prismic.io/docs/cli
Existing Slice Machine projects: https://prismic.io/docs/slice-machine
`,
);

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
		setTimeout(3000),
	]);
} catch {
	// Telemetry never blocks the message.
}

process.exit(1);
