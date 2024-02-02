import { expect, it } from "vitest";

import { UnauthenticatedError, UnauthorizedError } from "../src";

it("deletes a pair of linked repositories' Write API token", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1(
		"./git/linked-repos/write-api-token",
		{ hasWriteAPIToken: true },
		{
			method: "delete",
			body: {
				prismic: { domain: "domain" },
				git: { provider: "gitHub", owner: "owner", name: "name" },
			},
		},
	);

	await login();
	await expect(
		manager.git.deleteWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).resolves.not.toThrow();
});

it("throws UnauthenticatedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/linked-repos/write-api-token", undefined, {
		method: "delete",
		statusCode: 401,
	});

	await login();
	await expect(() =>
		manager.git.deleteWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).rejects.toThrow(UnauthenticatedError);
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/linked-repos/write-api-token", undefined, {
		method: "delete",
		statusCode: 403,
	});

	await login();
	await expect(() =>
		manager.git.deleteWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).rejects.toThrow(UnauthorizedError);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() =>
		manager.git.deleteWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).rejects.toThrow(UnauthenticatedError);
});
