import { expect, it } from "vitest";

import { UnauthenticatedError, UnauthorizedError } from "../src";

it("updates a pair of linked repositories' Write API token", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1(
		"./git/linked-repos/write-api-token",
		{ hasWriteAPIToken: true },
		{
			method: "put",
			body: {
				prismic: { domain: "domain" },
				git: { provider: "gitHub", owner: "owner", name: "name" },
				token: "token",
			},
		},
	);

	await login();
	await expect(
		manager.git.updateWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
			token: "token",
		}),
	).resolves.not.toThrow();
});

it("throws UnauthenticatedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/linked-repos/write-api-token", undefined, {
		method: "put",
		statusCode: 401,
	});

	await login();
	await expect(() =>
		manager.git.updateWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
			token: "token",
		}),
	).rejects.toThrow(UnauthenticatedError);
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/linked-repos/write-api-token", undefined, {
		method: "put",
		statusCode: 403,
	});

	await login();
	await expect(() =>
		manager.git.updateWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
			token: "token",
		}),
	).rejects.toThrow(UnauthorizedError);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() =>
		manager.git.updateWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
			token: "token",
		}),
	).rejects.toThrow(UnauthenticatedError);
});
