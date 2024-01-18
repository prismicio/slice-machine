import { expect, it } from "vitest";
import { UnauthenticatedError, UnauthorizedError } from "../src";

it("returns a list of linked repos for a repo", async ({ manager, api }) => {
	const domain = "domain";
	const repos = [{ provider: "gitHub", owner: "owner", name: "name" }];

	api.mockSliceMachineV1(
		"./git/linked-repos",
		{ repos },
		{ searchParams: { repository: domain } },
	);

	const res = await manager.git.fetchLinkedRepos({ prismic: { domain } });

	expect(res).toStrictEqual(repos);
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
}) => {
	api.mockSliceMachineV1("./git/linked-repos", undefined, { statusCode: 403 });

	await expect(() =>
		manager.git.fetchLinkedRepos({ prismic: { domain: "domain" } }),
	).rejects.toThrow(UnauthorizedError);
});

it("throws UnauthenticatedError if the user is logged out", async ({
	manager,
}) => {
	await manager.user.logout();

	await expect(() =>
		manager.git.fetchLinkedRepos({ prismic: { domain: "domain" } }),
	).rejects.toThrow(UnauthenticatedError);
});
