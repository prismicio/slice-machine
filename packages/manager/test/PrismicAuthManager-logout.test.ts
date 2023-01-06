import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { readPrismicAuthState } from "./__testutils__/readPrismicAuthState";

import { createPrismicAuthManager } from "../src";

it("removes user-specific data from the auth state file", async (ctx) => {
	const prismicAuthManager = createPrismicAuthManager();

	mockPrismicUserAPI(ctx);

	await prismicAuthManager.login(createPrismicAuthLoginResponse());

	await prismicAuthManager.logout();

	const authState = await readPrismicAuthState();

	expect(authState?.cookies).toBe("");
	expect(authState?.shortId).toBe(undefined);
	expect(authState?.intercomHash).toBe(undefined);
});
