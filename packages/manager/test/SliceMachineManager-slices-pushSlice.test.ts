import { expect, it, vi } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

it("pushes a Slice using the Custom Types API", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", sliceReadHookHandler);
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
	const repositoryName = await manager.project.getRepositoryName();

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(req, res, ctx) {
			if (req.headers.get("repository") === repositoryName) {
				return res(ctx.status(404));
			}
		},
		async onSliceInsert(req, res, ctx) {
			if (req.headers.get("repository") === repositoryName) {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: repositoryName,
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
	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: expect.any(String),
			};
		}),
	});
});

it("pushes a Slice using the Custom Types API using the currently set environment", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", sliceReadHookHandler);
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

	mockPrismicUserAPI(ctx);
	mockPrismicAuthAPI(ctx);

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(req, res, ctx) {
			if (req.headers.get("repository") === "foo") {
				return res(ctx.status(404));
			}
		},
		async onSliceInsert(req, res, ctx) {
			if (req.headers.get("repository") === "foo") {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
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
	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: expect.any(String),
			};
		}),
	});
});

it("updates variation screenshot URLs with a default image if no variation screenshot exists", async (ctx) => {
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

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			sentModel = await req.json();

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

	expect(sentModel).toStrictEqual({
		...model,
		variations: [
			{
				...model.variations[0],
				imageUrl:
					"https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format",
			},
		],
	});
});

it("updates variation screenshot URLs with uploaded screenshots", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const screenshotData = Buffer.from("screenshot-data");
	const sliceAssetReadHookHandler = vi.fn(() => {
		return { data: screenshotData };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", () => {
				return { model };
			});
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

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			sentModel = await req.json();

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
	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: uploadedScreenshotURL,
			};
		}),
	});
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

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(req, res, ctx) {
			if (req.params.id === model.id) {
				return res(ctx.json(model));
			}
		},
		async onSliceUpdate(req, res, ctx) {
			sentModel = await req.json();

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

	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: expect.any(String),
			};
		}),
	});
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
			hook("slice:update", vi.fn());
			hook("slice:asset:read", () => {
				return { data: screenshotData };
			});
			hook("slice:asset:update", vi.fn());
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

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(_req, res, ctx) {
			return res(ctx.status(404));
		},
		async onSliceInsert(req, res, ctx) {
			sentModel = await req.json();

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
	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: uploadedScreenshotURL,
			};
		}),
	});
});

it("sends the provided user agent", async (ctx) => {
	const model = ctx.mockPrismic.model.sharedSlice({
		variations: [ctx.mockPrismic.model.sharedSliceVariation()],
	});
	const sliceReadHookHandler = vi.fn(() => {
		return { model };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice:read", sliceReadHookHandler);
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
	const repositoryName = await manager.project.getRepositoryName();

	let sentModel;

	mockCustomTypesAPI(ctx, {
		async onSliceGet(req, res, ctx) {
			if (
				req.headers.get("user-agent") === "foo" &&
				req.headers.get("repository") === repositoryName
			) {
				return res(ctx.status(404));
			}
		},
		async onSliceInsert(req, res, ctx) {
			if (
				req.headers.get("user-agent") === "foo" &&
				req.headers.get("repository") === repositoryName
			) {
				sentModel = await req.json();

				return res(ctx.status(201));
			}
		},
	});
	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.slices.pushSlice({
		libraryID: "foo",
		sliceID: model.id,
		userAgent: "foo",
	});

	expectHookHandlerToHaveBeenCalledWithData(sliceReadHookHandler, {
		libraryID: "foo",
		sliceID: model.id,
	});
	expect(sentModel).toStrictEqual({
		...model,
		variations: model.variations.map((variation) => {
			return {
				...variation,
				imageUrl: expect.any(String),
			};
		}),
	});
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
	}).rejects.toThrowError(/authenticate before trying again/i);
});
