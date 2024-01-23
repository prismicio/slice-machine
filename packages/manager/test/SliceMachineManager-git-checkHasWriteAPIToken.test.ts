import { expect, it } from "vitest";

import { UnauthenticatedError, UnauthorizedError } from "../src";

it("returns true if linked repositories have a Prismic Write API token", async ({
	manager,
	api,
	login,
}) => {
	const prismic = { domain: "domain" };
	const git = { provider: "gitHub", owner: "owner", name: "name" } as const;

	api.mockSliceMachineV1(
		"./git/linked-repos/write-api-token",
		{ hasWriteAPIToken: true },
		{
			searchParams: {
				repository: prismic.domain,
				git: `${git.provider}@${git.owner}/${git.name}`,
			},
		},
	);

	await login();
	const res = await manager.git.checkHasWriteAPIToken({ prismic, git });

	expect(res).toStrictEqual(true);
});

it("returns false if linked repositories do not have a Prismic Write API token", async ({
	manager,
	api,
	login,
}) => {
	const prismic = { domain: "domain" };
	const git = { provider: "gitHub", owner: "owner", name: "name" } as const;

	api.mockSliceMachineV1(
		"./git/linked-repos/write-api-token",
		{ hasWriteAPIToken: false },
		{
			searchParams: {
				repository: prismic.domain,
				git: `${git.provider}@${git.owner}/${git.name}`,
			},
		},
	);

	await login();
	const res = await manager.git.checkHasWriteAPIToken({ prismic, git });

	expect(res).toStrictEqual(false);
});

it("throws UnauthenticatedError if the API returns 403", async ({
	manager,
	api,
	login,
}) => {
	api.mockSliceMachineV1("./git/linked-repos/write-api-token", undefined, {
		statusCode: 401,
	});

	await login();
	await expect(() =>
		manager.git.checkHasWriteAPIToken({
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
		statusCode: 403,
	});

	await login();
	await expect(() =>
		manager.git.checkHasWriteAPIToken({
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
		manager.git.checkHasWriteAPIToken({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).rejects.toThrow(UnauthenticatedError);
});
