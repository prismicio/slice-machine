import { ApplicationMode } from "./ApplicationMode";

export type APIEndpoints = {
	PrismicWroom: string;
	PrismicAuthentication: string;
	PrismicModels: string;
	PrismicUser: string;
	AwsAclProvider: string;
};

const ProductionAPIEndpoints: APIEndpoints = {
	PrismicWroom: "https://prismic.io/",
	PrismicAuthentication: "https://auth.prismic.io/",
	PrismicModels: "https://customtypes.prismic.io/",
	PrismicUser: "https://user.internal-prismic.io/",
	AwsAclProvider:
		"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
};

const StagingAPIEndpoints: APIEndpoints = {
	PrismicWroom: "https://wroom.io/",
	PrismicAuthentication: "https://auth.wroom.io/",
	PrismicModels: "https://customtypes.wroom.io/",
	PrismicUser: "https://user.wroom.io/",
	AwsAclProvider:
		"https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
};

const DevelopmentAPIEndpoints: APIEndpoints = {
	...StagingAPIEndpoints,
};

export const APIEndpoints: APIEndpoints = (() => {
	switch (process.env.SM_ENV) {
		case ApplicationMode.STAGING:
			return StagingAPIEndpoints;

		case ApplicationMode.DEVELOPMENT:
			return DevelopmentAPIEndpoints;

		case ApplicationMode.STAGING:
		default:
			return ProductionAPIEndpoints;
	}
})();
