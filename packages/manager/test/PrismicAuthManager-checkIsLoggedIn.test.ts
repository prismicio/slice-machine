import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createPrismicAuthManager } from "../src";

it("returns true if the user is logged in", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login(createPrismicAuthLoginResponse());

	const res = await prismicAuthManager.checkIsLoggedIn();

	expect(res).toBe(true);
});

it("returns false if the user is logged out", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx);

	await prismicAuthManager.logout();

	const res = await prismicAuthManager.checkIsLoggedIn();

	expect(res).toBe(false);
});

it("returns false if the user is logged in with an expired token", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx, {
		validateEndpoint: {
			isValid: false,
		},
	});
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login(createPrismicAuthLoginResponse());

	const res = await prismicAuthManager.checkIsLoggedIn();

	expect(res).toBe(false);
});

it("logs out the user if they are logged in with an expired token", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicAuthAPI(ctx, {
		validateEndpoint: {
			isValid: false,
		},
	});
	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login(createPrismicAuthLoginResponse());

	await prismicAuthManager.checkIsLoggedIn();

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe("");
	expect(authState?.shortId).toBe(undefined);
	expect(authState?.intercomHash).toBe(undefined);
});
