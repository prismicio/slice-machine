import { ApplicationMode } from "./ApplicationMode";

export const SLICE_MACHINE_USER_AGENT = "slice-machine";

type APIEndpoints = {
	PrismicWroom: string;
	PrismicAuthentication: string;
	PrismicModels: string;
	PrismicUser: string;
	AwsAclProvider: string;
};

export const APIEndpoints: APIEndpoints = (() => {
	switch (process.env.SM_ENV) {
		case ApplicationMode.DEVELOPMENT:
		case ApplicationMode.STAGING:
			return {
				PrismicWroom: "https://wroom.io/",
				PrismicAuthentication: "https://auth.wroom.io/",
				PrismicModels: "https://customtypes.wroom.io/",
				PrismicUser: "https://user.wroom.io/",
				AwsAclProvider:
					"https://2iamcvnxf4.execute-api.us-east-1.amazonaws.com/stage/",
			};

		case ApplicationMode.PRODUCTION:
		default:
			return {
				PrismicWroom: "https://prismic.io/",
				PrismicAuthentication: "https://auth.prismic.io/",
				PrismicModels: "https://customtypes.prismic.io/",
				PrismicUser: "https://user.internal-prismic.io/",
				AwsAclProvider:
					"https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/",
			};
	}
})();

type APITokens = {
	SegmentKey: string;
};

export const APITokens: APITokens = (() => {
	switch (process.env.SM_ENV) {
		case ApplicationMode.DEVELOPMENT:
		case ApplicationMode.STAGING:
		case ApplicationMode.PRODUCTION:
		default:
			return {
				// TODO: Sort tracked events in a single source, for now this points only to: https://app.segment.com/prismic/sources/slicejavascript2/settings/keys
				SegmentKey: "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
			};
	}
})();
