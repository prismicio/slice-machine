import * as t from "io-ts";
import fetch from "./fetch";
import pLimit from "p-limit";

import { decode } from "./decode";

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
export type GitHubReleaseMetadata = t.TypeOf<typeof GitHubReleaseMetadata>;

type FetchAllGitHubReleasesArgs = {
	repositoryOwner: string;
	repositoryName: string;
};

const fetchAllGitHubReleases = async (
	args: FetchAllGitHubReleasesArgs,
): Promise<GitHubReleaseMetadata[]> => {
	const res = await fetch(
		`https://api.github.com/repos/${args.repositoryOwner}/${args.repositoryName}/releases`,
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
	repositoryOwner: string;
	repositoryName: string;
	packageName?: string;
	version: string;
};

const fetchGitHubReleaseByVersion = async (
	args: FetchGitHubReleaseByVersionArgs,
): Promise<GitHubReleaseMetadata | undefined> => {
	let url: string;

	if (args.packageName) {
		url = `https://api.github.com/repos/${args.repositoryOwner}/${args.repositoryName}/releases/tags/${args.packageName}@${args.version}`;
	} else {
		url = `https://api.github.com/repos/${args.repositoryOwner}/${args.repositoryName}/releases/tags/${args.version}`;
	}

	const res = await fetch(url, {
		headers: {
			Accept: GITHUB_JSON_ACCEPT_HEADER,
		},
	});

	if (res.ok) {
		const json = await res.json();

		const { value, error } = decode(GitHubReleaseMetadata, json);

		if (error) {
			throw new Error(`Invalid GitHub Release response.`, { cause: error });
		}

		return value;
	}
};

type FetchGitHubReleaseBodyForReleaseArgs = {
	repositoryOwner: string;
	repositoryName: string;
	packageName?: string;
	version: string;
	cache?: Record<string, GitHubReleaseMetadata | undefined>;
};

const _fetchGitHubReleaseBodyForRelease = async (
	args: FetchGitHubReleaseBodyForReleaseArgs,
): Promise<string | undefined> => {
	const cache = args.cache || {};

	if (Object.keys(cache).length < 1) {
		const releases = await fetchAllGitHubReleases({
			repositoryOwner: args.repositoryOwner,
			repositoryName: args.repositoryName,
		});

		for (const release of releases) {
			cache[release.name] = release;
		}
	}

	if (args.version in cache) {
		const release = cache[args.version];

		return release?.body ?? undefined;
	} else {
		try {
			const version = await fetchGitHubReleaseByVersion({
				repositoryOwner: args.repositoryOwner,
				repositoryName: args.repositoryName,
				packageName: args.packageName,
				version: args.version,
			});

			cache[args.version] = version;

			return version?.body ?? undefined;
		} catch {
			cache[args.version] = undefined;

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
