import * as t from "io-ts";
import fetch from "node-fetch";

import { decode } from "./decode";

const SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION = "prismicio";
const SLICE_MACHINE_GITHUB_REPOSITORY_NAME = "slice-machine";

const GITHUB_JSON_ACCEPT_HEADER = "application/vnd.github+json";

/**
 * A minimally defined codec for GitHub release metadata.
 *
 * @see https://docs.github.com/en/rest/releases/releases#get-a-release-by-tag-name
 */
const GitHubReleaseMetadataCodec = t.type({
	body: t.union([t.null, t.string]),
});

type FetchGitHubReleaseBodyForReleaseArgs = {
	tag: string;
};

export const fetchGitHubReleaseBodyForRelease = async (
	args: FetchGitHubReleaseBodyForReleaseArgs,
): Promise<string | undefined> => {
	const res = await fetch(
		`https://api.github.com/repos/${SLICE_MACHINE_GITHUB_REPOSITORY_ORGANIZATION}/${SLICE_MACHINE_GITHUB_REPOSITORY_NAME}/releases/tags/${args.tag}`,
		{
			headers: {
				Accept: GITHUB_JSON_ACCEPT_HEADER,
			},
		},
	);

	const json = await res.json();

	const { value, error } = decode(GitHubReleaseMetadataCodec, json);

	if (error) {
		throw new Error(`Invalid GitHub Release response.`, { cause: error });
	}

	return value.body ?? undefined;
};
