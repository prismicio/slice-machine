import { APPLICATION_MODE } from "./APPLICATION_MODE";
import { GIT_PROVIDER, GitProvider } from "./GIT_PROVIDER";

export type GitProviderAppSlugs = Record<GitProvider, string>;

export const GIT_PROVIDER_APP_SLUGS: GitProviderAppSlugs = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development: {
			return {
				[GIT_PROVIDER.GitHub]:
					process.env.GITHUB_APP_SLUG ?? "prismic-io-staging",
			};
		}

		case APPLICATION_MODE.Staging: {
			return {
				[GIT_PROVIDER.GitHub]: "prismic-io-staging",
			};
		}

		case APPLICATION_MODE.Production:
		default: {
			return {
				[GIT_PROVIDER.GitHub]: "prismic-io",
			};
		}
	}
})();
