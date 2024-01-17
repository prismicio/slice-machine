import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager, SliceMachineManager } from "../src";
import { rest, RestRequest } from "msw";

it("returns a GitHub auth state token", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const key = "foo";
	const expiresAt = new Date(Date.now() + 1000 * 60 * 5);

	const checkAuthorizationToken = (
		req: RestRequest,
		authenticationToken: string,
	): boolean => {
		return req.headers.get("Authorization") === `Bearer ${authenticationToken}`;
	};

	const buildURL = (endpoint: string, manager: SliceMachineManager): string => {
		return new URL(
			endpoint,
			manager.getAPIEndpoints().SliceMachineV1,
		).toString();
	};

	ctx.msw.use(
		rest.get(
			buildURL("./git/github/create-auth-state", manager),
			(req, res, ctx) => {
				if (!checkAuthorizationToken(req, authenticationToken)) {
					return;
				}

				return res(
					ctx.json({
						key,
						expiresAt: expiresAt.toISOString(),
					}),
				);
			},
		),
	);

	const result = await manager.git.createGitHubAuthState();

	expect(result).toStrictEqual({ key, expiresAt });
});
