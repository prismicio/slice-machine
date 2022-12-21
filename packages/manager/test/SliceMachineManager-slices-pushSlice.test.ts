import { it } from "vitest";

it.todo("pushes a Slice using the Custom Types API");

// import { expect, it } from "vitest";
//
// import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
// import { createTestPlugin } from "./__testutils__/createTestPlugin";
// import { createTestProject } from "./__testutils__/createTestProject";
// import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
// import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
// import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
//
// import { createSliceMachineManager } from "../src";
//
// it("pushes a Slice using the Custom Types API", async (ctx) => {
// 	const model = ctx.mockPrismic.model.sharedSlice();
// 	const adapter = createTestPlugin({
// 		setup: ({ hook }) => {
// 			hook("slice:read", () => {
// 				return { model };
// 			});
// 		},
// 	});
// 	const cwd = await createTestProject({ adapter });
// 	const manager = createSliceMachineManager({
// 		nativePlugins: { [adapter.meta.name]: adapter },
// 		cwd,
// 	});
//
// 	await manager.plugins.initPlugins();
//
// 	mockPrismicUserAPI(ctx);
// 	mockPrismicAuthAPI(ctx);
// 	mockCustomTypesAPI(ctx, {
// 		async onSliceGet(_req, res, ctx) {
// 			return res(ctx.status(404));
// 		},
// 		async onSliceInsert(req, res, ctx) {
// 			expect(await req.json()).toStrictEqual(model);
//
// 			return res(ctx.status(201));
// 		},
// 	});
//
// 	await manager.user.login(createPrismicAuthLoginResponse());
// 	await manager.slices.pushSlice({ id: model.id });
//
// 	expect.assertions(2);
// });
//
// it("uses the update endpoint if the Slice already exists", async (ctx) => {
// 	const model = ctx.mockPrismic.model.sharedSlice();
// 	const adapter = createTestPlugin({
// 		setup: ({ hook }) => {
// 			hook("slice:read", () => {
// 				return { model };
// 			});
// 		},
// 	});
// 	const cwd = await createTestProject({ adapter });
// 	const manager = createSliceMachineManager({
// 		nativePlugins: { [adapter.meta.name]: adapter },
// 		cwd,
// 	});
//
// 	await manager.plugins.initPlugins();
//
// 	mockPrismicUserAPI(ctx);
// 	mockPrismicAuthAPI(ctx);
// 	mockCustomTypesAPI(ctx, {
// 		onSliceGet: (req, res, ctx) => {
// 			if (req.params.id === model.id) {
// 				return res(ctx.json(model));
// 			}
// 		},
// 		onSliceUpdate: async (req, res, ctx) => {
// 			expect(await req.json()).toStrictEqual(model);
//
// 			return res(ctx.status(204));
// 		},
// 	});
//
// 	await manager.user.login(createPrismicAuthLoginResponse());
// 	await manager.slices.pushSlice({ id: model.id });
//
// 	expect.assertions(2);
// });
//
// it("throws if plugins have not been initialized", async () => {
// 	const cwd = await createTestProject();
// 	const manager = createSliceMachineManager({ cwd });
//
// 	await expect(async () => {
// 		await manager.slices.pushSlice({ id: "id" });
// 	}).rejects.toThrow(/plugins have not been initialized/i);
// });
//
// it("throws if not logged in", async () => {
// 	const adapter = createTestPlugin();
// 	const cwd = await createTestProject({ adapter });
// 	const manager = createSliceMachineManager({
// 		nativePlugins: { [adapter.meta.name]: adapter },
// 		cwd,
// 	});
//
// 	await manager.plugins.initPlugins();
//
// 	await manager.user.logout();
//
// 	await expect(async () => {
// 		await manager.slices.pushSlice({ id: "id" });
// 	}).rejects.toThrow(/not logged in/i);
// });
