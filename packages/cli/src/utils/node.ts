import semver from "semver";
import chalk from "chalk";

import { engines } from "../../package.json";

export function warnIfUnsupportedNode(): void {
	const requiredVersion = engines?.node;

	if (!requiredVersion) {
		throw new Error("Missing engines.node in package.json.");
	}

	const currentVersion = process.version;

	if (!semver.satisfies(currentVersion, requiredVersion)) {
		console.warn(
			chalk.yellow(
				`⚠️  Warning: You are using Node.js ${currentVersion}, but this CLI requires ${requiredVersion}.\n` +
					`   Some features may not work correctly. Please upgrade your Node.js version.\n`,
			),
		);
	}
}
