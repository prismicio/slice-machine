import { expect, it } from "vitest";
import express from "express";
import fetch from "node-fetch";
import { AddressInfo } from "node:net";

import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";

import {
	createPrismicAuthManager,
	createPrismicAuthManagerMiddleware,
} from "../src";

it.skip("creates an Express middleware to handle browser-based login", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();
	const middleware = createPrismicAuthManagerMiddleware({
		prismicAuthManager,
	});

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	const app = express();
	app.use(middleware);

	const server = app.listen();
	const { port } = server.address() as AddressInfo;
	const endpoint = `http://localhost:${port}/`;

	try {
		await fetch(endpoint, {
			method: "post",
			body: JSON.stringify({
				email: "name@example.com",
				cookies: ["prismic-auth=token", "SESSION=session"],
			}),
		});

		const authenticationToken =
			await prismicAuthManager.getAuthenticationCookies();

		expect(authenticationToken).toBe("token");
	} finally {
		server.close();
	}
});
