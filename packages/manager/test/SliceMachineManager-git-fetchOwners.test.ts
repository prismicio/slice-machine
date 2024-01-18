import { expect, it } from "vitest";

import { UnauthenticatedError, UnauthorizedError } from "../src";

it("returns a list of owners for the user", async ({ manager, api, login }) => {
	const owners = [{ provider: "gitHub", id: "id", name: "name", type: "user" }];

	api.mockSliceMachineV1("./git/owners", { owners });

	await login();
	const res = await manager.git.fetchOwners();

	expect(res).toStrictEqual(owners);
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/owners", undefined, { statusCode: 403 });

	await login();
	await expect(() => manager.git.fetchOwners()).rejects.toThrow(
		UnauthorizedError,
	);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() => manager.git.fetchOwners()).rejects.toThrow(
		UnauthenticatedError,
	);
});
