import { TestContext } from "vitest";
import { rest } from "msw";

type GitHubReleaseMetadata = {
	name: string;
	body: string | null;
};

type MockGitHubReleasesAPIConfig = {
	repositoryOwner: string;
	repositoryName: string;
	batchEndpoint?: {
		releases: GitHubReleaseMetadata[];
	};
	individualEndpoint?: {
		releases: {
			packageName: string;
			tag: string;
			release: GitHubReleaseMetadata;
		}[];
	};
};

export const mockGitHubReleasesAPI = (
	ctx: TestContext,
	config: MockGitHubReleasesAPIConfig,
): void => {
	const endpoint = `https://api.github.com/repos/${config.repositoryOwner}/${config.repositoryName}/`;

	if (config.batchEndpoint) {
		ctx.msw.use(
			rest.get(new URL("./releases", endpoint).toString(), (_req, res, ctx) => {
				return res(ctx.json(config.batchEndpoint?.releases));
			}),
		);
	}

	if (config.individualEndpoint) {
		ctx.msw.use(
			rest.get(
				new URL(`./releases/tags/:tag`, endpoint).toString(),
				(_req, res, ctx) => {
					return res(ctx.status(404));
				},
			),
		);

		for (const release of config.individualEndpoint.releases) {
			ctx.msw.use(
				rest.get(
					new URL(
						`./releases/tags/${release.packageName}@${release.tag}`,
						endpoint,
					).toString(),
					(_req, res, ctx) => {
						return res(ctx.json(release.release));
					},
				),
			);
		}
	}
};
