import { addTrailingSlash, removeTrailingSlash } from "../lib/trailingSlash";
import { APPLICATION_MODE } from "./APPLICATION_MODE";

export type APIEndpoints = {
	PrismicWroom: string;
	PrismicAuthentication: string;
	PrismicModels: string;
	PrismicUser: string;
	AwsAclProvider: string;
	PrismicOembed: string;
	PrismicUnsplash: string;
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
				PrismicOembed: removeTrailingSlash(
					process.env.oembed_endpoint ?? "https://oembed.wroom.io",
				),
				PrismicUnsplash: removeTrailingSlash(
					process.env.unsplash_endpoint ?? "https://unsplash.wroom.io",
				),
			};

			const missingAPIEndpoints = Object.keys(apiEndpoints).filter((key) => {
				return !apiEndpoints[key as keyof typeof apiEndpoints];
			});

			if (missingAPIEndpoints.length > 0) {
				console.error(
					`You are running Slice Machine in development mode where API endpoints are configured via environment variables. The following endpoints were not configured: ${missingAPIEndpoints.join(
						", ",
					)}. Configure them before continuing.`,
				);

				process.exit(1);
			}

			return apiEndpoints as APIEndpoints;
		}

		case APPLICATION_MODE.Staging: {
			return {
				PrismicWroom: "https://wroom.io/",
				PrismicAuthentication: "https://auth.wroom.io/",
				PrismicModels: "https://customtypes.wroom.io/",
				PrismicUser: "https://user.wroom.io/",
				AwsAclProvider:
					"https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
				PrismicOembed: "https://oembed.wroom.io",
				PrismicUnsplash: "https://unsplash.wroom.io",
			};
		}

		case APPLICATION_MODE.Production:
		default: {
			return {
				PrismicWroom: "https://prismic.io/",
				PrismicAuthentication: "https://auth.prismic.io/",
				PrismicModels: "https://customtypes.prismic.io/",
				PrismicUser: "https://user.internal-prismic.io/",
				AwsAclProvider:
					"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
				PrismicOembed: "https://oembed.prismic.io",
				PrismicUnsplash: "https://unsplash.prismic.io",
			};
		}
	}
})();
