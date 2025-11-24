#!/usr/bin/env node

import semver from "semver";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf8"),
);

if (!semver.satisfies(process.version, pkg.engines.node)) {
	console.log(
		`Required node version ${pkg.engines.node} not satisfied with current version ${process.version}.`,
	);
	process.exit(1);
}

import("../dist/cli.cjs");
