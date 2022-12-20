import { expect, it } from "vitest";

import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createPrismicAuthManager } from "../src";

it("returns parsed cookies from the auth state file", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authenticationCookies =
		await prismicAuthManager.getAuthenticationCookies();

	expect(authenticationCookies).toStrictEqual({
		"prismic-auth": "token",
		SESSION: "session",
	});
});

it("throws if the user is not logged in", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	await prismicAuthManager.logout();

	expect(async () => {
		await prismicAuthManager.getAuthenticationCookies();
	}).rejects.toThrow(/not logged in/i);
});
