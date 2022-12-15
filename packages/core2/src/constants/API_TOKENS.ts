import { APPLICATION_MODE } from "./APPLICATION_MODE";

type APITokens = {
	SegmentKey: string;
};

export const API_TOKENS: APITokens = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development:
		case APPLICATION_MODE.Staging:
		case APPLICATION_MODE.Production:
		default:
			return {
				// TODO: Sort tracked events in a single source, for now this points only to: https://app.segment.com/prismic/sources/slicejavascript2/settings/keys
				SegmentKey: "JfTfmHaATChc4xueS7RcCBsixI71dJIJ",
			};
	}
})();
