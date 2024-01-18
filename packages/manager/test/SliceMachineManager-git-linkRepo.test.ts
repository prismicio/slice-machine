import { expect, it } from "vitest";
import { UnauthenticatedError, UnauthorizedError } from "../src";

it("links a Git repository to a Prismic repository", async ({
	manager,
	api,
}) => {
	api.mockSliceMachineV1("./git/linked-repos", undefined, {
		method: "put",
		body: {
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		},
	});

	await expect(
		manager.git.linkRepo({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).resolves.not.toThrow();
});

it("throws UnauthorizedError if the API returns 403", async ({
	manager,
	api,
}) => {
	api.mockSliceMachineV1("./git/linked-repos", undefined, {
		method: "put",
		statusCode: 403,
	});

	await expect(() =>
		manager.git.linkRepo({
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
		manager.git.linkRepo({
			prismic: { domain: "domain" },
			git: { provider: "gitHub", owner: "owner", name: "name" },
		}),
	).rejects.toThrow(UnauthenticatedError);
});
