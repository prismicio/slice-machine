#!/usr/bin/env node

import semver from "semver";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf8"),
);

const requiredVersion = pkg.engines.node;

if (!requiredVersion) {
	throw new Error("Missing engines.node in package.json.");
}

const currentVersion = process.version;

if (!semver.satisfies(currentVersion, requiredVersion)) {
	console.warn(
		chalk.yellow(
			`⚠️  Warning: You are using Node.js ${currentVersion}, but this tool requires ${requiredVersion}.\n` +
				`   Some features may not work correctly. Please upgrade your Node.js version.\n`,
		),
	);
}

import("../dist/cli.cjs");
