import type { PrismicManager } from "@prismicio/manager";
import semver from "semver";

import { listrRun } from "../utils/listr";

type CheckCLIVersionArgs = {
	manager: PrismicManager;
	currentVersion: string;
};

/**
 * Checks if the current CLI version is the latest available version. Throws an
 * Error if the version is outdated.
 *
 * @param args - Arguments object containing the manager and current version.
 *
 * @throws Error If the current version is not the latest.
 */
export async function checkCLIVersion(
	args: CheckCLIVersionArgs,
): Promise<void> {
	await listrRun([
		{
			title: "Checking CLI version...",
			task: async (_, parentTask) => {
				// Skip version check if current version is a pre-release (alpha, beta, rc, etc.)
				if (semver.prerelease(args.currentVersion) !== null) {
					parentTask.title =
						"CLI version is a pre-release, skipping version check";
				} else {
					const isLatestVersion =
						await args.manager.versions.checkIsCLIVersionLatest({
							currentVersion: args.currentVersion,
						});

					if (!isLatestVersion) {
						const latestVersion =
							await args.manager.versions.getLatestCLIVersion();

						throw new Error(
							`You are using an outdated version (${args.currentVersion}). The latest version is ${latestVersion}.`,
						);
					}

					parentTask.title = "CLI version is up to date";
				}
			},
		},
	]);
}
