import { APPLICATION_MODE } from "./APPLICATION_MODE";

type APITokens = {
	SegmentKey: string;
};

export const API_TOKENS: APITokens = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development:
		case APPLICATION_MODE.Staging:
			return { SegmentKey: "Ng5oKJHCGpSWplZ9ymB7Pu7rm0sTDeiG" };
		case undefined:
		case "":
		case APPLICATION_MODE.Production:
			return { SegmentKey: "cGjidifKefYb6EPaGaqpt8rQXkv5TD6P" };
		default:
			throw new Error(`Unknown application mode "${process.env.SM_ENV}".`);
	}
})();
