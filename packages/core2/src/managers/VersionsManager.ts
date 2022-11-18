import { fetchGitHubReleaseBodyForRelease } from "../lib/fetchGitHubReleaseBodyForRelease";
import { fetchNPMPackageVersions } from "../lib/fetchNPMPackageVersions";

import { SLICE_MACHINE_NPM_PACKAGE_NAME } from "../constants";

import { BaseManager } from "./BaseManager";

type SliceMachineManagerGetReleaseNotesForVersionArgs = {
	version: string;
};

export class VersionsManger extends BaseManager {
	async getAllStableSliceMachineVersions(): Promise<string[]> {
		const versions = await fetchNPMPackageVersions({
			packageName: SLICE_MACHINE_NPM_PACKAGE_NAME,
		});

		return versions.filter((version) => {
			// Exclude tagged versions (e.g. `1.0.0-alpha.0`).
			// Exclude versions < 0.1.0 (e.g. `0.0.1`).
			return /^\d+\.[1-9]\d*\.\d+$/.test(version);
		});
	}

	// TODO: I was rate limited :(
	// Rather than making a request or each version, we can make one
	// request for all (at least to some paginated amount) and smartly
	// extract the notes for the individual version.
	async getReleaseNotesForVersion(
		args: SliceMachineManagerGetReleaseNotesForVersionArgs,
	): Promise<string | undefined> {
		return await fetchGitHubReleaseBodyForRelease({
			tag: args.version,
		});
	}
}
