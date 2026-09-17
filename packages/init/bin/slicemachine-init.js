#!/usr/bin/env node

// Slice Machine is deprecated. Every run says so. Without `--force` the run
// stops here; with it, the original CLI takes over.

import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { parseArgs } from "node:util";

// The manager's ES build has directory imports Node rejects; use CommonJS.
const require = createRequire(import.meta.url);
const { createSliceMachineManager } = require("@slicemachine/manager");
const pkg = require("../package.json");

const { values } = parseArgs({
	args: process.argv.slice(2),
	options: {
		repository: { type: "string", short: "r" },
		force: { type: "boolean" },
	},
	strict: false,
	allowPositionals: true,
});
// The previous parser also accepted `-r=<name>`.
const repository =
	typeof values.repository === "string"
		? values.repository.replace(/^=/, "")
		: undefined;
// `--force=true` parses as a string, so accept both spellings.
const forced = values.force === true || values.force === "true";

const prismicInit = repository
	? `npx prismic init --repo ${repository}`
	: "npx prismic init";
const slicemachineInit = repository
	? `npx @slicemachine/init --repository ${repository} --force`
	: "npx @slicemachine/init --force";

process.stderr.write(
	forced
		? `Slice Machine is deprecated. Continuing because --force was passed.
New projects should use the Type Builder: ${prismicInit}
Docs: https://prismic.io/docs/cli
`
		: `Slice Machine is deprecated. New projects should use the Type Builder.

Start one with the Prismic CLI:

  ${prismicInit}

To use Slice Machine anyway, add --force:

  ${slicemachineInit}

If someone asked you to set this up, check with them first.

AI agents: npx skills add --global --yes prismicio/skills
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
	const tracked = manager.telemetry.track({
		event: "command:init:deprecation",
		repository,
		forced,
	});
	// A forced run has the rest of the command to deliver the event.
	if (!forced) {
		await Promise.race([tracked, setTimeout(3000)]);
	}
} catch {
	// Telemetry never blocks the message.
}

if (!forced) {
	process.exit(1);
}

// The CLI parses its own flags and rejects unknown ones, so hide `--force`.
process.argv = process.argv.filter(
	(argument) => argument !== "--force" && !argument.startsWith("--force="),
);
await import("../dist/cli.cjs");
