import { expect, it } from "vitest";
import { createServer } from "node:http";

import { createPrismicAuthManager } from "../src";

it("returns a URL and port to facilitate browser-based authentication", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	const res = await prismicAuthManager.getLoginSessionInfo();

	expect(res).toStrictEqual({
		port: 5555,
		url: "https://prismic.io/dashboard/cli/login?source=slice-machine&port=5555",
	});
});

it("returns a random port if the default port is in use", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	const server = createServer();
	server.listen(5555);

	const res = await prismicAuthManager.getLoginSessionInfo();

	server.close();

	expect(res.port).not.toBe(5555);
	expect(res.port).toStrictEqual(expect.any(Number));
});
