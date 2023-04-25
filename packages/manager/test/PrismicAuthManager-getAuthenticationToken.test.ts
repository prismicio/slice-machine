import { expect, it } from "vitest";

import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createPrismicAuthManager } from "../src";

it("returns the user's Prismic authentication token", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authenticationToken = await prismicAuthManager.getAuthenticationToken();

	expect(authenticationToken).toBe("token");
});

it("throws if the user is not logged in", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	await prismicAuthManager.logout();

	expect(async () => {
		await prismicAuthManager.getAuthenticationToken();
	}).rejects.toThrow(/not logged in/i);
});
