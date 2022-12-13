import { fetchGitHubReleaseBodyForRelease } from "./lib/fetchGitHubReleaseBodyForRelease";
import { fetchNPMPackageVersions } from "./lib/fetchNPMPackageVersions";

export const getAllStableSliceMachineVersions = async (): Promise<string[]> => {
	const versions = await fetchNPMPackageVersions({
		// TODO: Put with constants
		packageName: "slice-machine-ui",
	});

	return versions.filter((version) => {
		// Exclude tagged versions (e.g. `1.0.0-alpha.0`).
		// Exclude versions < 0.1.0 (e.g. `0.0.1`).
		return /^\d+\.[1-9]\d*\.\d+$/.test(version);
	});
};

type GetReleaseNotesForVersionArgs = {
	version: string;
};

export const getReleaseNotesForVersion = (
	args: GetReleaseNotesForVersionArgs,
): Promise<string | undefined> => {
	return fetchGitHubReleaseBodyForRelease({
		version: args.version,
	});
};
