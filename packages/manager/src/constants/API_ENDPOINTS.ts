import { addTrailingSlash, removeTrailingSlash } from "../lib/trailingSlash";
import { APPLICATION_MODE } from "./APPLICATION_MODE";

export type APIEndpoints = {
	PrismicWroom: string;
	PrismicAuthentication: string;
	PrismicModels: string;
	PrismicUser: string;
	AwsAclProvider: string;
	PrismicEmbed: string;
	PrismicUnsplash: string;
	SliceMachineV1: string;
	RepositoryService: string;
	LocaleService: string;
	CustomTypeService: string;
	GitService: string;
};

export const API_ENDPOINTS: APIEndpoints = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development: {
			const apiEndpoints = {
				PrismicWroom: addTrailingSlash(process.env.wroom_endpoint),
				PrismicAuthentication: addTrailingSlash(
					process.env.authentication_server_endpoint,
				),
				PrismicModels: addTrailingSlash(process.env.customtypesapi_endpoint),
				PrismicUser: addTrailingSlash(process.env.user_service_endpoint),
				AwsAclProvider: addTrailingSlash(process.env.acl_provider_endpoint),
				PrismicEmbed: removeTrailingSlash(
					process.env.oembed_endpoint ?? "https://oembed.wroom.io",
				),
				PrismicUnsplash: addTrailingSlash(
					process.env.unsplash_endpoint ?? "https://unsplash.wroom.io/",
				),
				SliceMachineV1: addTrailingSlash(
					process.env.slice_machine_v1_endpoint ??
						"https://sm-api.wroom.io/v1/",
				),
				RepositoryService: addTrailingSlash(
					process.env.repository_api ??
						"https://api.internal.wroom.io/repository/",
				),
				LocaleService: addTrailingSlash(
					process.env.locale_api ?? "https://api.internal.wroom.io/locale/",
				),
				CustomTypeService: addTrailingSlash(
					process.env.custom_type_api ??
						"https://api.internal.wroom.io/custom-type/",
				),
				GitService: addTrailingSlash(
					process.env.git_service_endpoint ?? "https://git.internal.wroom.io/",
				),
			};

			const missingAPIEndpoints = Object.keys(apiEndpoints).filter((key) => {
				return !apiEndpoints[key as keyof typeof apiEndpoints];
			});

			if (missingAPIEndpoints.length > 0) {
				console.error(
					`You are running Slice Machine in development mode (SM_ENV=${
						APPLICATION_MODE.Development
					}) where API endpoints are configured via environment variables.

The following endpoints were not configured: ${missingAPIEndpoints.join(", ")}.

Configure them before continuing.`,
				);

				process.exit(1);
			}

			console.warn(`You are running Slice Machine in development mode (SM_ENV=${
				APPLICATION_MODE.Development
			}).

The following API endpoints were configured via environment variables:
${Object.entries(apiEndpoints)
	.map(([name, endpoint]) => `  - ${name}: ${endpoint}`)
	.join("\n")}

These endpoints are different than Slice Machine's normal endpoints and are not trusted.

If you didn't intend to run Slice Machine this way, stop it immediately and unset the SM_ENV environment variable.`);

			return apiEndpoints as APIEndpoints;
		}

		case APPLICATION_MODE.Staging: {
			return {
				PrismicWroom: "https://wroom.io/",
				PrismicAuthentication: "https://auth.wroom.io/",
				PrismicModels: "https://customtypes.wroom.io/",
				PrismicUser: "https://user-service.wroom.io/",
				AwsAclProvider: "https://acl-provider.wroom.io/",
				PrismicEmbed: "https://oembed.wroom.io",
				PrismicUnsplash: "https://unsplash.wroom.io/",
				SliceMachineV1: "https://sm-api.wroom.io/v1/",
				RepositoryService: "https://api.internal.wroom.io/repository/",
				LocaleService: "https://api.internal.wroom.io/locale/",
				CustomTypeService: "https://api.internal.wroom.io/custom-type/",
				GitService: "https://git.internal.wroom.io/",
			};
		}

		case APPLICATION_MODE.DevTools:
		case APPLICATION_MODE.MarketingTools:
		case APPLICATION_MODE.Platform: {
			return {
				PrismicWroom: `https://${process.env.SM_ENV}-wroom.com/`,
				PrismicAuthentication: `https://auth.${process.env.SM_ENV}-wroom.com/`,
				PrismicModels: `https://customtypes.${process.env.SM_ENV}-wroom.com/`,
				PrismicUser: `https://user-service.${process.env.SM_ENV}-wroom.com/`,
				AwsAclProvider: `https://acl-provider.${process.env.SM_ENV}-wroom.com/`,
				PrismicEmbed: `https://oembed.${process.env.SM_ENV}-wroom.com`,
				PrismicUnsplash: `https://unsplash.${process.env.SM_ENV}-wroom.com/`,
				SliceMachineV1: `https://sm-api.${process.env.SM_ENV}-wroom.com/v1/`,
				RepositoryService: `https://api.internal.${process.env.SM_ENV}-wroom.com/repository/`,
				LocaleService: `https://api.internal.${process.env.SM_ENV}-wroom.com/locale/`,
				CustomTypeService: `https://api.internal.${process.env.SM_ENV}-wroom.com/custom-type/`,
				GitService: `https://git.internal.${process.env.SM_ENV}-wroom.com/`,
			};
		}

		case APPLICATION_MODE.Production:
		default: {
			return {
				PrismicWroom: "https://prismic.io/",
				PrismicAuthentication: "https://auth.prismic.io/",
				PrismicModels: "https://customtypes.prismic.io/",
				PrismicUser: "https://user-service.prismic.io/",
				AwsAclProvider: "https://acl-provider.prismic.io/",
				PrismicEmbed: "https://oembed.prismic.io",
				PrismicUnsplash: "https://unsplash.prismic.io/",
				SliceMachineV1: "https://sm-api.prismic.io/v1/",
				RepositoryService: "https://api.internal.prismic.io/repository/",
				LocaleService: "https://api.internal.prismic.io/locale/",
				CustomTypeService: "https://api.internal.prismic.io/custom-type/",
				GitService: "https://git.internal.prismic.io/",
			};
		}
	}
})();
