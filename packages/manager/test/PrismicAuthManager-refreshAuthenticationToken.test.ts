import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createPrismicAuthManager } from "../src";

it("refreshes the auth token in the auth state file", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	const { refreshedToken } = mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	await prismicAuthManager.refreshAuthenticationToken();

	const authenticationToken = await prismicAuthManager.getAuthenticationToken();

	expect(authenticationToken).not.toBe("token");
	expect(authenticationToken).toBe(refreshedToken);
});

it("throws if the authentication API cannot refresh the token", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx, {
		refreshtokenEndpoint: {
			isSuccessful: false,
		},
	});
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login(createPrismicAuthLoginResponse());

	await expect(async () => {
		await prismicAuthManager.refreshAuthenticationToken();
	}).rejects.toThrow(/failed to refresh/i);
});

it("throws if the user is not logged in", async () => {
	const prismicAuthManager = createPrismicAuthManager();

	await prismicAuthManager.logout();

	expect(async () => {
		await prismicAuthManager.getAuthenticationToken();
	}).rejects.toThrow(/not logged in/i);
});
