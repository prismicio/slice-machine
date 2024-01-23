import { APPLICATION_MODE } from "./APPLICATION_MODE";

type APITokens = {
	SegmentKey: string;
	AmplitudeKey: string;
};

export const API_TOKENS: APITokens = (() => {
	switch (process.env.SM_ENV) {
		case APPLICATION_MODE.Development:
		case APPLICATION_MODE.Staging:
			return {
				SegmentKey: "Ng5oKJHCGpSWplZ9ymB7Pu7rm0sTDeiG",
				AmplitudeKey: "client-rqVU4xTNaz7F51nBfKRUa0K3qnODiqzh",
			};
		case undefined:
		case "":
		case APPLICATION_MODE.Production:
			return {
				SegmentKey: "cGjidifKefYb6EPaGaqpt8rQXkv5TD6P",
				AmplitudeKey: "client-JuQQWUPimfKWId3WWU6p8xSkTiFqd1qV",
			};
		default:
			throw new Error(`Unknown application mode "${process.env.SM_ENV}".`);
	}
})();
