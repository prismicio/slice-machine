import { expect, it, vi } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

it("pushes a Slice using the Custom Types API", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model };
	});
	const sliceUpdateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", sliceReadHookHandler);
			hook("slice:update", sliceUpdateHookHandler);
		},
	});
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
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...model,
				variations: model.variations.map((variation) => {
					return {
						...variation,
						imageUrl: expect.any(String),
					};
				}),
			});

			return res(ctx.status(201));
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceReadHookHandler, {
		libraryID: "foo",
		sliceID: model.id,
	});
	expectHookHandlerToHaveBeenCalledWithData(sliceUpdateHookHandler, {
		libraryID: "foo",
		model: {
			...model,
			variations: [
				{
					...model.variations[0],
					imageUrl: expect.any(String),
				},
			],
		},
	});
	expect.assertions(4);
});

it("updates variation screenshot URLs with a default image if no variation screenshot exists", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const sliceUpdateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
			hook("slice:update", sliceUpdateHookHandler);
		},
	});
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
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...model,
				variations: [
					{
						...model.variations[0],
						imageUrl:
							"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
					},
				],
			});

			return res(ctx.status(201));
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceUpdateHookHandler, {
		libraryID: "foo",
		model: {
			...model,
			variations: [
				{
					...model.variations[0],
					imageUrl:
						"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
				},
			],
		},
	});
	expect.assertions(3);
});

it("updates variation screenshot URLs with uploaded screenshots", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const screenshotData = Buffer.from("screenshot-data");
	const sliceAssetReadHookHandler = vi.fn(() => {
		return { data: screenshotData };
	});
	const sliceUpdateHookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
			hook("slice:update", sliceUpdateHookHandler);
			hook("slice:asset:read", sliceAssetReadHookHandler);
		},
	});
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
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			expectedUploads: [
				{
					file: screenshotData,
				},
			],
		},
	});

	const uploadedScreenshotURL = new URL(
		`./${sliceMachineConfig.repositoryName}/shared-slices/${model.id}/${model.variations[0].id}/d70850dbc1e2db543553c50034432a5da660a1d5?auto=compress%2Cformat`,
		s3ACL.imgixEndpoint,
	).toString();

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...model,
				variations: model.variations.map((variation) => {
					return {
						...variation,
						imageUrl: uploadedScreenshotURL,
					};
				}),
			});

			return res(ctx.status(201));
		},
	});

	await manager.screenshots.initS3ACL();

	await manager.slices.updateSliceScreenshot({
		libraryID: "foo",
		sliceID: model.id,
		variationID: model.variations[0].id,
		data: Buffer.from("screenshot-data"),
	});

	await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceAssetReadHookHandler, {
		libraryID: "foo",
		sliceID: model.id,
		assetID: `screenshot-${model.variations[0].id}.png`,
	});
	expectHookHandlerToHaveBeenCalledWithData(sliceUpdateHookHandler, {
		libraryID: "foo",
		model: {
			...model,
			variations: [
				{
					...model.variations[0],
					imageUrl: uploadedScreenshotURL,
				},
			],
		},
	});
	expect.assertions(4);
});

it("uses the update endpoint if the Slice already exists", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
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

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	mockCustomTypesAPI(ctx, {
		async onSliceGet(req, res, ctx) {
			if (req.params.id === model.id) {
				return res(ctx.json(model));
			}
		},
		async onSliceUpdate(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...model,
				variations: model.variations.map((variation) => {
					return {
						...variation,
						imageUrl: expect.any(String),
					};
				}),
			});

			return res(ctx.status(201));
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expect.assertions(2);
});

it("returns a record of variation IDs mapped to uploaded screenshot URLs", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const screenshotData = Buffer.from("screenshot-data");
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
			hook("slice:update", () => {
				// noop
			});
			hook("slice:asset:read", () => {
				return { data: screenshotData };
			});
		},
	});
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
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	const { s3ACL } = mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
		uploadEndpoint: {
			expectedUploads: [
				{
					file: screenshotData,
				},
			],
		},
	});

	const uploadedScreenshotURL = new URL(
		`./${sliceMachineConfig.repositoryName}/shared-slices/${model.id}/${model.variations[0].id}/d70850dbc1e2db543553c50034432a5da660a1d5?auto=compress%2Cformat`,
		s3ACL.imgixEndpoint,
	).toString();

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			expect(await req.json()).toStrictEqual({
				...model,
				variations: model.variations.map((variation) => {
					return {
						...variation,
						imageUrl: uploadedScreenshotURL,
					};
				}),
			});

			return res(ctx.status(201));
		},
	});

	await manager.screenshots.initS3ACL();

	await manager.slices.updateSliceScreenshot({
		libraryID: "foo",
		sliceID: model.id,
		variationID: model.variations[0].id,
		data: Buffer.from("screenshot-data"),
	});

	const res = await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
	});

	expect(res).toStrictEqual({
		screenshotURLs: {
			[model.variations[0].id]: uploadedScreenshotURL,
		},
		errors: [],
	});
	expect.assertions(3);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.slices.pushSlice({
			libraryID: "foo",
			sliceID: "bar",
		});
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
		await manager.slices.pushSlice({
			libraryID: "foo",
			sliceID: "bar",
		});
	}).rejects.toThrow(/not logged in/i);
});
