import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager, UnauthenticatedError } from "../src";

it("pushes a Custom Type using the Custom Types API", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const repositoryName = await manager.project.getRepositoryName();

	let sentModel;

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	mockCustomTypesAPI(ctx, {
		async onCustomTypeGet(req, res, ctx) {
			if (req.headers.get("repository") === repositoryName) {
				return res(ctx.status(404));
			}
		},
		async onCustomTypeInsert(req, res, ctx) {
			if (req.headers.get("repository") === repositoryName) {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());
	await manager.customTypes.pushCustomType({ id: model.id });
	expect(sentModel).toStrictEqual(model);
});

it("pushes a Custom Type using the Custom Types API using the currently set environment", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
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

	let sentModel;

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	mockCustomTypesAPI(ctx, {
		async onCustomTypeGet(req, res, ctx) {
			if (req.headers.get("repository") === "foo") {
				return res(ctx.status(404));
			}
		},
		async onCustomTypeInsert(req, res, ctx) {
			if (req.headers.get("repository") === "foo") {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());
	await manager.customTypes.pushCustomType({ id: model.id });

	expect(sentModel).toStrictEqual(model);
});

it("uses the update endpoint if the Custom Type already exists", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	let sentModel;

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	mockCustomTypesAPI(ctx, {
		onCustomTypeGet: (req, res, ctx) => {
			if (req.params.id === model.id) {
				return res(ctx.json(model));
			}
		},
		onCustomTypeUpdate: async (req, res, ctx) => {
			sentModel = await req.json();

			return res(ctx.status(204));
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());
	await manager.customTypes.pushCustomType({ id: model.id });
	// TODO: update prismic/mock
	expect(sentModel).toStrictEqual({ ...model, format: "custom" });
});

it("sends the provided user agent", async (ctx) => {
	const model = ctx.mockPrismic.model.customType();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model };
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const repositoryName = await manager.project.getRepositoryName();

	let sentModel;

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);
	mockCustomTypesAPI(ctx, {
		async onCustomTypeGet(req, res, ctx) {
			if (
				req.headers.get("user-agent") === "foo" &&
				req.headers.get("repository") === repositoryName
			) {
				return res(ctx.status(404));
			}
		},
		async onCustomTypeInsert(req, res, ctx) {
			if (
				req.headers.get("user-agent") === "foo" &&
				req.headers.get("repository") === repositoryName
			) {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());
	await manager.customTypes.pushCustomType({ id: model.id, userAgent: "foo" });

	expect(sentModel).toStrictEqual(model);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.customTypes.pushCustomType({ id: "id" });
	}).rejects.toThrow(/plugins have not been initialized/i);
});

it("throws if not logged in", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await manager.user.logout();

	await expect(async () => {
		await manager.customTypes.pushCustomType({ id: "id" });
	}).rejects.toThrow(UnauthenticatedError);
});
