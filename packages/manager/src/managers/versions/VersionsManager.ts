import * as fs from "node:fs/promises";
import * as path from "node:path";
import semver from "semver";

import { decodePackageJSON } from "../../lib/decodePackageJSON";
import {
	fetchGitHubReleaseBodyForRelease,
	GitHubReleaseMetadata,
} from "../../lib/fetchGitHubReleaseBodyForRelease";
import { fetchNPMPackageVersions } from "../../lib/fetchNPMPackageVersions";

import { SLICE_MACHINE_GITHUB_PACKAGE_NAME } from "../../constants/SLICE_MACHINE_GITHUB_PACKAGE_NAME";
import { SLICE_MACHINE_GITHUB_REPOSITORY_NAME } from "../../constants/SLICE_MACHINE_GITHUB_REPOSITORY_NAME";
import { SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION } from "../../constants/SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION";
import { SLICE_MACHINE_NPM_PACKAGE_NAME } from "../../constants/SLICE_MACHINE_NPM_PACKAGE_NAME";
import { VERSION_KIND } from "../../constants/VERSION_KIND";

import { BaseManager } from "../BaseManager";

import { Version } from "./types";

const detectVersionBumpKind = (
	to: string,
	from?: string,
): (typeof VERSION_KIND)[keyof typeof VERSION_KIND] | undefined => {
	if (!from) {
		return VERSION_KIND.FIRST;
	}

	if (semver.eq(to, from)) {
		return undefined;
	} else if (semver.satisfies(to, `~${from}`)) {
		return VERSION_KIND.PATCH;
	} else if (semver.satisfies(to, `^${from}`)) {
		return VERSION_KIND.MINOR;
	} else {
		return VERSION_KIND.MAJOR;
	}
};

const filterStableVersions = (versions: string[]): string[] => {
	return versions.filter((version) => {
		// Exclude tagged versions (e.g. `1.0.0-alpha.0`).
		// Exclude versions < 0.1.0 (e.g. `0.0.1`).
		return (
			/^[1-9]\d*\.\d+\.\d+$/.test(version) ||
			/^\d+\.[1-9]\d*\.\d+$/.test(version)
		);
	});
};

const readPackageJSON = async (packageDir: string) => {
	const packageJSONContents = await fs.readFile(
		path.join(packageDir, "package.json"),
		"utf8",
	);

	let packageJSON: unknown;
	try {
		packageJSON = JSON.parse(packageJSONContents);
	} catch {
		// noop
	}

	const { value, error } = decodePackageJSON(packageJSON);

	if (error) {
		throw new Error(
			`Invalid ${packageDir} \`package.json\` file. ${error.errors.join(", ")}`,
		);
	}

	return value;
};

type SliceMachineManagerGetReleaseNotesForVersionArgs = {
	version: string;
};

export class VersionsManager extends BaseManager {
	/**
	 * Record of version numbers mapped to their GitHub release metadata.
	 */
	gitHubSliceMachineReleaseMetadataCache: Record<
		string,
		GitHubReleaseMetadata | undefined
	> = {};

	async getRunningSliceMachineVersion(): Promise<string> {
		const sliceMachineDir = await this.project.locateSliceMachineUIDir();
		const packageJSON = await readPackageJSON(sliceMachineDir);

		return packageJSON.version;
	}

	async getAllStableSliceMachineVersions(): Promise<string[]> {
		const versions = await fetchNPMPackageVersions({
			packageName: SLICE_MACHINE_NPM_PACKAGE_NAME,
		});
		const filteredVersions = filterStableVersions(versions);

		return semver.rsort(filteredVersions);
	}

	async getAllStableSliceMachineVersionsWithKind(): Promise<Version[]> {
		const versions = await this.getAllStableSliceMachineVersions();

		return versions.map((version, i) => {
			const previousVersion = versions[i + 1];

			return {
				version,
				kind: detectVersionBumpKind(version, previousVersion),
			};
		});
	}

	async getLatestNonBreakingSliceMachineVersion(): Promise<string | undefined> {
		const versions = await this.getAllStableSliceMachineVersions();
		const currentVersion = await this.getRunningSliceMachineVersion();

		return semver.maxSatisfying(versions, `^${currentVersion}`) ?? undefined;
	}

	async checkIsSliceMachineUpdateAvailable(): Promise<boolean> {
		const versions = await this.getAllStableSliceMachineVersions();
		const currentVersion = await this.getRunningSliceMachineVersion();

		return semver.gt(versions[0], currentVersion);
	}

	async getRunningAdapterVersion(): Promise<string> {
		const adapterDir = await this.project.locateAdapterDir();
		const value = await readPackageJSON(adapterDir);

		return value.version;
	}

	async getAllStableAdapterVersions(): Promise<string[]> {
		const adapterName = await this.project.getAdapterName();
		const versions = await fetchNPMPackageVersions({
			packageName: adapterName,
		});
		const filteredVersions = filterStableVersions(versions);

		return semver.rsort(filteredVersions);
	}

	async checkIsAdapterUpdateAvailable(): Promise<boolean> {
		const versions = await this.getAllStableAdapterVersions();
		const currentVersion = await this.getRunningAdapterVersion();

		return semver.gt(versions[0], currentVersion);
	}

	async getSliceMachineReleaseNotesForVersion(
		args: SliceMachineManagerGetReleaseNotesForVersionArgs,
	): Promise<string | undefined> {
		return await fetchGitHubReleaseBodyForRelease({
			repositoryOwner: SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION,
			repositoryName: SLICE_MACHINE_GITHUB_REPOSITORY_NAME,
			packageName: SLICE_MACHINE_GITHUB_PACKAGE_NAME,
			version: args.version,
			cache: this.gitHubSliceMachineReleaseMetadataCache,
		});
	}
}
