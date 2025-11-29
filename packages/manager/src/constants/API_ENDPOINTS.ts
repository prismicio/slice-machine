import { addTrailingSlash } from "../lib/trailingSlash";

import { APPLICATION_MODE } from "./APPLICATION_MODE";

export type APIEndpoints = {
	PrismicWroom: string;
	PrismicLegacyAuthenticationApi: string;
	PrismicLegacyCustomTypesApi: string;
	PrismicLegacyUserApi: string;
	PrismicLegacyAclApi: string;
	PrismicLegacySliceMachineApi: string;
};

export const API_ENDPOINTS: APIEndpoints = (() => {
	switch (process.env.PRISMIC_ENV) {
		case APPLICATION_MODE.Development: {
			const apiEndpoints = {
				PrismicWroom: addTrailingSlash(process.env.wroom_endpoint),
				PrismicLegacyAuthenticationApi: addTrailingSlash(
					process.env.legacy_authentication_api_endpoint,
				),
				PrismicLegacyCustomTypesApi: addTrailingSlash(
					process.env.legacy_custom_types_api_endpoint,
				),
				PrismicLegacyUserApi: addTrailingSlash(
					process.env.legacy_user_api_endpoint,
				),
				PrismicLegacyAclApi: addTrailingSlash(
					process.env.legacy_acl_api_endpoint,
				),
				PrismicLegacySliceMachineApi: addTrailingSlash(
					process.env.legacy_slice_machine_api_endpoint,
				),
			};

			const missingAPIEndpoints = Object.keys(apiEndpoints).filter((key) => {
				return !apiEndpoints[key as keyof typeof apiEndpoints];
			});

			if (missingAPIEndpoints.length > 0) {
				console.error(
					`You are running the command in development mode (PRISMIC_ENV=${
						APPLICATION_MODE.Development
					}) where API endpoints are configured via environment variables.

The following endpoints were not configured: ${missingAPIEndpoints.join(", ")}.

Configure them before continuing.`,
				);

				process.exit(1);
			}

			console.warn(`You are running the command in development mode (PRISMIC_ENV=${
				APPLICATION_MODE.Development
			}).

The following API endpoints were configured via environment variables:
${Object.entries(apiEndpoints)
	.map(([name, endpoint]) => `  - ${name}: ${endpoint}`)
	.join("\n")}

These endpoints are different than Prismic's normal endpoints and are not trusted.

If you didn't intend to run the command this way, stop it immediately and unset the PRISMIC_ENV environment variable.`);

			return apiEndpoints as APIEndpoints;
		}

		case APPLICATION_MODE.Staging: {
			return {
				PrismicWroom: "https://wroom.io/",
				PrismicLegacyAuthenticationApi: "https://auth.wroom.io/",
				PrismicLegacyCustomTypesApi: "https://customtypes.wroom.io/",
				PrismicLegacyUserApi: "https://user-service.wroom.io/",
				PrismicLegacyAclApi: "https://acl-provider.wroom.io/",
				PrismicLegacySliceMachineApi: "https://sm-api.wroom.io/v1/",
			};
		}

		case APPLICATION_MODE.DevTools:
		case APPLICATION_MODE.MarketingTools:
		case APPLICATION_MODE.Platform: {
			return {
				PrismicWroom: `https://${process.env.PRISMIC_ENV}-wroom.com/`,
				PrismicLegacyAuthenticationApi: `https://auth.${process.env.PRISMIC_ENV}-wroom.com/`,
				PrismicLegacyCustomTypesApi: `https://customtypes.${process.env.PRISMIC_ENV}-wroom.com/`,
				PrismicLegacyUserApi: `https://user-service.${process.env.PRISMIC_ENV}-wroom.com/`,
				PrismicLegacyAclApi: `https://acl-provider.${process.env.PRISMIC_ENV}-wroom.com/`,
				PrismicLegacySliceMachineApi: `https://sm-api.${process.env.PRISMIC_ENV}-wroom.com/v1/`,
			};
		}

		case APPLICATION_MODE.Production:
		default: {
			return {
				PrismicWroom: "https://prismic.io/",
				PrismicLegacyAuthenticationApi: "https://auth.prismic.io/",
				PrismicLegacyCustomTypesApi: "https://customtypes.prismic.io/",
				PrismicLegacyUserApi: "https://user-service.prismic.io/",
				PrismicLegacyAclApi: "https://acl-provider.prismic.io/",
				PrismicLegacySliceMachineApi: "https://sm-api.prismic.io/v1/",
			};
		}
	}
})();
