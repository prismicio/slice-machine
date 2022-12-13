import { ApplicationMode } from "./";

export type APITokens = {
	SegmentKey: string;
};

const StagingAPITokens: APITokens = {
	SegmentKey: "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
};

// TODO: Real token
const DevelopmentAPITokens: APITokens = {
	...StagingAPITokens,
};

// TODO: Real token
const ProductionAPITokens: APITokens = {
	...StagingAPITokens,
};

export const APITokens: APITokens = (() => {
	switch (process.env.SM_ENV) {
		case ApplicationMode.STAGING:
			return StagingAPITokens;

		case ApplicationMode.DEVELOPMENT:
			return DevelopmentAPITokens;

		case ApplicationMode.STAGING:
		default:
			return ProductionAPITokens;
	}
})();
