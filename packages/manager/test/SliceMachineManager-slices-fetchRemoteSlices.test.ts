import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager, UnauthenticatedError } from "../src";

it("fetches Slices from the Custom Types API", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const sliceMachineConfig = await manager.project.getSliceMachineConfig();
	const authenticationToken = await manager.user.getAuthenticationToken();

	const models = [
		ctx.mockPrismic.model.sharedSlice(),
		ctx.mockPrismic.model.sharedSlice(),
	];

	mockCustomTypesAPI(ctx, {
		onSliceGetAll: (req, res, ctx) => {
			if (
				req.headers.get("repository") === sliceMachineConfig.repositoryName &&
				req.headers.get("Authorization") === `Bearer ${authenticationToken}`
			) {
				return res(ctx.json(models));
			}
		},
	});

	const res = await manager.slices.fetchRemoteSlices();

	expect(res).toStrictEqual(models);
});

it("throws if the user is not logged in", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	manager.user.logout();

	await expect(async () => {
		await manager.slices.fetchRemoteSlices();
	}).rejects.toThrow(UnauthenticatedError);
});
