import http from "node:http";
import https from "node:https";
import nodeFetch, { RequestInfo, RequestInit } from "node-fetch";

export * from "node-fetch";

const httpAgent = new http.Agent({
	keepAlive: true,
});
const httpsAgent = new https.Agent({
	keepAlive: true,
});

const options: RequestInit = {
	agent: function (_parsedURL) {
		if (_parsedURL.protocol == "http:") {
			return httpAgent;
		} else {
			return httpsAgent;
		}
	},
};

/**
 * Wrapper around node-fetch that passes an user-agent with the keepAlive option
 * enabled
 */
export default function fetch(
	url: URL | RequestInfo,
	init?: RequestInit,
): ReturnType<typeof nodeFetch> {
	const opts = {
		...options,
		...init,
	};

	return nodeFetch(url, opts);
}
