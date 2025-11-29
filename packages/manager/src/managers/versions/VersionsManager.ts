import semver from "semver";

import { PRISMIC_CLI_NPM_PACKAGE_NAME } from "../../constants/PRISMIC_CLI_NPM_PACKAGE_NAME";
import { fetchNPMPackageVersions } from "../../lib/fetchNPMPackageVersions";
import { BaseManager } from "../BaseManager";

type CheckCLIVersionLatestArgs = {
	currentVersion: string;
};

export class VersionsManager extends BaseManager {
	/**
	 * Fetches the latest stable version of the Prismic CLI from npm.
	 *
	 * @returns The latest stable version string.
	 */
	async getLatestCLIVersion(): Promise<string> {
		const versions = await fetchNPMPackageVersions({
			packageName: PRISMIC_CLI_NPM_PACKAGE_NAME,
		});

		// Filter out pre-release versions (alpha, beta, rc, etc.)
		const stableVersions = versions.filter((version) => {
			return semver.prerelease(version) === null;
		});

		if (stableVersions.length === 0) {
			throw new Error(
				"No stable versions found for the package on the npm registry.",
			);
		}

		// Sort versions in descending order and return the latest
		const sortedVersions = semver.rsort(stableVersions);

		return sortedVersions[0];
	}

	/**
	 * Checks if the current CLI version is the latest available version.
	 *
	 * @param args - Arguments object containing the current version.
	 *
	 * @returns `true` if the current version is the latest, `false` otherwise.
	 */
	async checkIsCLIVersionLatest(
		args: CheckCLIVersionLatestArgs,
	): Promise<boolean> {
		const latestVersion = await this.getLatestCLIVersion();

		return semver.eq(args.currentVersion, latestVersion);
	}
}
