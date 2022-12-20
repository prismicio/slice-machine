import * as t from "io-ts";
import fetch from "node-fetch";
import pLimit from "p-limit";

import { decode } from "./decode";

const SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION = "prismicio";
const SLICE_MACHINE_GITHUB_REPOSITORY_NAME = "slice-machine";
const SLICE_MACHINE_GITHUB_PACKAGE_NAME = "slice-machine-ui";

const GITHUB_JSON_ACCEPT_HEADER = "application/vnd.github+json";

/**
 * A minimally defined codec for GitHub release metadata.
 *
 * @see https://docs.github.com/en/rest/releases/releases#get-a-release-by-tag-name
 */
const GitHubReleaseMetadata = t.type({
	name: t.string,
	body: t.union([t.null, t.string]),
});
type GitHubReleaseMetadata = t.TypeOf<typeof GitHubReleaseMetadata>;

const fetchAllGitHubReleases = async (): Promise<GitHubReleaseMetadata[]> => {
	const res = await fetch(
		`https://api.github.com/repos/${SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION}/${SLICE_MACHINE_GITHUB_REPOSITORY_NAME}/releases`,
		{
			headers: {
				Accept: GITHUB_JSON_ACCEPT_HEADER,
			},
		},
	);

	if (res.ok) {
		const json = await res.json();

		const { value, error } = decode(t.array(GitHubReleaseMetadata), json);

		if (error) {
			throw new Error(`Invalid GitHub Release response.`, { cause: error });
		}

		return value;
	} else {
		throw new Error(`Invalid GitHub Release response.`);
	}
};

type FetchGitHubReleaseByVersionArgs = {
	version: string;
};

const fetchGitHubReleaseByVersion = async (
	args: FetchGitHubReleaseByVersionArgs,
): Promise<GitHubReleaseMetadata | undefined> => {
	const res = await fetch(
		`https://api.github.com/repos/${SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION}/${SLICE_MACHINE_GITHUB_REPOSITORY_NAME}/releases/tags/${SLICE_MACHINE_GITHUB_PACKAGE_NAME}@${args.version}`,
		{
			headers: {
				Accept: GITHUB_JSON_ACCEPT_HEADER,
			},
		},
	);

	if (res.ok) {
		const json = await res.json();

		const { value, error } = decode(GitHubReleaseMetadata, json);

		if (error) {
			throw new Error(`Invalid GitHub Release response.`, { cause: error });
		}

		return value;
	}
};

/**
 * Record of version numbers mapped to their GitHub release metadata.
 */
const cachedReleases: Record<string, GitHubReleaseMetadata | undefined> = {};

type FetchGitHubReleaseBodyForReleaseArgs = {
	version: string;
};

const _fetchGitHubReleaseBodyForRelease = async (
	args: FetchGitHubReleaseBodyForReleaseArgs,
): Promise<string | undefined> => {
	if (Object.keys(cachedReleases).length < 1) {
		const releases = await fetchAllGitHubReleases();

		for (const release of releases) {
			cachedReleases[release.name] = release;
		}
	}

	if (args.version in cachedReleases) {
		const release = cachedReleases[args.version];

		return release?.body ?? undefined;
	} else {
		try {
			const version = await fetchGitHubReleaseByVersion({
				version: args.version,
			});

			cachedReleases[args.version] = version;

			return version?.body ?? undefined;
		} catch {
			cachedReleases[args.version] = undefined;

			return undefined;
		}
	}
};

const limit = pLimit(1);

export const fetchGitHubReleaseBodyForRelease = async (
	...args: Parameters<typeof _fetchGitHubReleaseBodyForRelease>
): ReturnType<typeof _fetchGitHubReleaseBodyForRelease> => {
	return await limit(() => _fetchGitHubReleaseBodyForRelease(...args));
};
