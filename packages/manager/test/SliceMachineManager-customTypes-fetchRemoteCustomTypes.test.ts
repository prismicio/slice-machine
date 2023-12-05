import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager, UnauthenticatedError } from "../src";

it("fetches Custom Types from the Custom Types API", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const sliceMachineConfig = await manager.project.getSliceMachineConfig();
	const authenticationToken = await manager.user.getAuthenticationToken();

	const models = [
		ctx.mockPrismic.model.customType(),
		ctx.mockPrismic.model.customType(),
	];

	mockCustomTypesAPI(ctx, {
		onCustomTypeGetAll: (req, res, ctx) => {
			if (
				req.headers.get("repository") === sliceMachineConfig.repositoryName &&
				req.headers.get("Authorization") === `Bearer ${authenticationToken}` &&
				req.headers.get("user-agent") === "slice-machine"
			) {
				return res(ctx.json(models));
			}
		},
	});

	const res = await manager.customTypes.fetchRemoteCustomTypes();

	expect(res).toStrictEqual(models);
});

it("fetches Custom Types from the Custom Types API using the currently set environment", async (ctx) => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	mockPrismicAuthAPI(ctx);
	mockPrismicUserAPI(ctx);

	await manager.user.login({
		email: "name@example.com",
		cookies: ["prismic-auth=token", "SESSION=session"],
	});

	const authenticationToken = await manager.user.getAuthenticationToken();

	const models = [
		ctx.mockPrismic.model.customType(),
		ctx.mockPrismic.model.customType(),
	];

	mockCustomTypesAPI(ctx, {
		onCustomTypeGetAll: (req, res, ctx) => {
			if (
				req.headers.get("repository") === "foo" &&
				req.headers.get("Authorization") === `Bearer ${authenticationToken}` &&
				req.headers.get("user-agent") === "slice-machine"
			) {
				return res(ctx.json(models));
			}
		},
	});

	const res = await manager.customTypes.fetchRemoteCustomTypes();

	expect(res).toStrictEqual(models);
});

it("throws if the user is not logged in", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	manager.user.logout();

	await expect(async () => {
		await manager.customTypes.fetchRemoteCustomTypes();
	}).rejects.toThrow(UnauthenticatedError);
});
