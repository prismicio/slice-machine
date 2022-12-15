import { APPLICATION_MODE } from "./APPLICATION_MODE";

type APIEndpoints = {
	PrismicWroom: string;
	PrismicAuthentication: string;
	PrismicModels: string;
	PrismicUser: string;
	AwsAclProvider: string;
};

export const API_ENDPOINTS: APIEndpoints = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development:
		case APPLICATION_MODE.Staging:
			return {
				PrismicWroom: "https://wroom.io/",
				PrismicAuthentication: "https://auth.wroom.io/",
				PrismicModels: "https://customtypes.wroom.io/customtypes/",
				PrismicUser: "https://user.wroom.io/",
				AwsAclProvider:
					"https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
			};

		case APPLICATION_MODE.Production:
		default:
			return {
				PrismicWroom: "https://prismic.io/",
				PrismicAuthentication: "https://auth.prismic.io/",
				PrismicModels: "https://customtypes.prismic.io/customtypes/",
				PrismicUser: "https://user.internal-prismic.io/",
				AwsAclProvider:
					"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
			};
	}
})();
