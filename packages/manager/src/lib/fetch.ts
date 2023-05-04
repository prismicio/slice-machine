// This temporary wrapper around `node-fetch` fixes an issue where quick
// consecutive network requests cause failed requests.
//
// See https://github.com/node-fetch/node-fetch/issues/1735 for more details.
//
// TODO: Remove this wrapper and replace all imports with `node-fetch` if https://github.com/node-fetch/node-fetch/pull/1736 is merged.

import * as http from "node:http";
import * as https from "node:https";
import baseFetch from "node-fetch";

export * from "node-fetch";

/**
 * The default HTTP Agent with `keepAlive: true` used in `fetch()` requests.
 */
const DEFAULT_HTTP_AGENT = new http.Agent({ keepAlive: true });

/**
 * The default HTTPS Agent with `keepAlive: true` used in `fetch()` requests.
 */
const DEFAULT_HTTPS_AGENT = new https.Agent({ keepAlive: true });

/**
 * Patched `fetch()` from `node-fetch` that fixes a bug where quick consecutive
 * network requests cause failed requests.
 *
 * Use this `fetch()` in place of `node-fetch`'s `fetch()`.
 *
 * @remarks
 * `fetch()` is patched by setting an HTTP/HTTPS Agent with `keepAlive: true`.
 * If you need to assign an Agent, be sure to retain the `keepAlive: true`
 * option.
 */
const fetch: typeof baseFetch = (url, init) => {
	return baseFetch(url, {
		agent: (parsedURL) => {
			return parsedURL.protocol === "http:"
				? DEFAULT_HTTP_AGENT
				: DEFAULT_HTTPS_AGENT;
		},
		...init,
	});
};

export default fetch;
