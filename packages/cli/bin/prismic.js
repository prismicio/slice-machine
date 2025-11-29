#!/usr/bin/env node
/* eslint-env node */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// Check Node.js version BEFORE importing any dependencies
// This prevents errors from dependencies that require newer Node.js features
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const requiredVersion = packageJson.engines?.node;

if (requiredVersion) {
	// eslint-disable-next-line no-undef
	const currentVersion = process.versions.node;
	const [major, minor, patch] = currentVersion
		.split(".")
		.map((v) => Number.parseInt(v, 10));

	// Parse required version range (e.g., ">=20.19.0", "^20.19.0", "20.19.0")
	const rangeMatch = requiredVersion.match(/(?:>=|^)\s*(\d+)\.(\d+)\.(\d+)/);
	if (rangeMatch) {
		const [, reqMajor, reqMinor, reqPatch] = rangeMatch.map((v) =>
			Number.parseInt(v, 10),
		);

		// Compare versions: major.minor.patch
		const isUnsupported =
			major < reqMajor ||
			(major === reqMajor && minor < reqMinor) ||
			(major === reqMajor && minor === reqMinor && patch < reqPatch);

		if (isUnsupported) {
			// eslint-disable-next-line no-undef
			console.error(
				`\n⚠️  Warning: Unsupported Node.js version\n` +
					`   Current: ${currentVersion}\n` +
					`   Required: ${requiredVersion}\n` +
					`\nSome features may not work correctly. Please upgrade your Node.js version.\n`,
			);
		}
	}
}

import("../dist/cli.js");
