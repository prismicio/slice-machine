import { expect, it } from "vitest";

import { UnauthenticatedError, UnauthorizedError } from "../src";

it("returns a GitHub auth state token", async ({ manager, api, login }) => {
	const key = "foo";
	const expiresAt = new Date();

	api.mockSliceMachineV1(
		"./git/github/create-auth-state",
		{ key, expiresAt: expiresAt.toISOString() },
		{ checkAuthentication: true },
	);

	await login();
	const res = await manager.git.createGitHubAuthState();

	expect(res).toStrictEqual({ key, expiresAt });
});

it("throws UnauthorizedError if the API returns 401", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/github/create-auth-state", undefined, {
		statusCode: 401,
	});

	await login();
	await expect(() => manager.git.createGitHubAuthState()).rejects.toThrow(
		UnauthorizedError,
	);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() => manager.git.createGitHubAuthState()).rejects.toThrow(
		UnauthenticatedError,
	);
});
