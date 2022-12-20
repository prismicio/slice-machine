import { expect, it } from "vitest";

import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createPrismicAuthManager } from "../src";

it("returns the profile for the user", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx);
	const { profile } = mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const res = await prismicAuthManager.getProfile();

	expect(res).toStrictEqual(profile);
});

it("throws if the user is not logged in", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	await prismicAuthManager.logout();

	expect(async () => {
		await prismicAuthManager.getAuthenticationToken();
	}).rejects.toThrow(/not logged in/i);
});
