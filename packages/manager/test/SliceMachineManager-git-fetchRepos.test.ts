import { expect, it } from "vitest";
import { UnauthenticatedError, UnauthorizedError } from "../src";

it("returns a list of repos for an owner", async ({ manager, api }) => {
	const repos = [
		{
			provider: "gitHub",
			id: "id",
			owner: "owner",
			name: "name",
			url: "url",
			pushedAt: new Date(),
		},
	];

	api.mockSliceMachineV1(
		"./git/repos",
		{ repos },
		{ searchParams: { provider: "gitHub", owner: "owner" } },
	);

	const res = await manager.git.fetchRepos({
		provider: "gitHub",
		owner: "owner",
	});

	expect(res).toStrictEqual(repos);
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
}) => {
	api.mockSliceMachineV1("./git/repos", undefined, { statusCode: 403 });

	await expect(() =>
		manager.git.fetchRepos({
			provider: "gitHub",
			owner: "owner",
		}),
	).rejects.toThrow(UnauthorizedError);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() =>
		manager.git.fetchRepos({
			provider: "gitHub",
			owner: "owner",
		}),
	).rejects.toThrow(UnauthenticatedError);
});
