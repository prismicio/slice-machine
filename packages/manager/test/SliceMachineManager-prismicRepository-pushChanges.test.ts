import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";
import { mockSliceMachineAPI } from "./__testutils__/mockSliceMachineAPI";

import { createSliceMachineManager } from "../src";
import { PushBody, ChangeTypes } from "../src/managers/prismicRepository/types";

const pushChangesPayload = (
	sliceIDs = ["slice1"],
	customTypeIDs = ["slice1"],
) => ({
	confirmDeleteDocuments: false,
	changes: [
		...sliceIDs.map((id) => ({
			id,
			status: "NEW" as const,
			type: "Slice" as const,
			libraryID: "slice-library",
		})),
		...customTypeIDs.map((id) => ({
			id,
			status: "MODIFIED" as const,
			type: "CustomType" as const,
		})),
	],
});

it("pushes changes using the push API", async (ctx) => {
	const customTypeModel = ctx.mockPrismic.model.customType();
	const sharedSliceModel = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model: customTypeModel };
			});
			hook("slice:read", () => {
				return { model: sharedSliceModel };
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
	mockSliceMachineAPI(ctx, {
		async onPush(req, res, ctx) {
			if (req.headers.get("user-agent") === "slice-machine") {
				sentModel = await req.json();

				return res(ctx.status(204));
			}
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();
	const sliceMachineConfig = await manager.project.getSliceMachineConfig();

	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: sliceMachineConfig.repositoryName,
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.prismicRepository.pushChanges(
		pushChangesPayload([sharedSliceModel.id], [customTypeModel.id]),
	);

	const expectedAPIPayload: PushBody = {
		changes: [
			{
				id: sharedSliceModel.id,
				type: ChangeTypes.SLICE_INSERT,
				payload: sharedSliceModel,
			},
			{
				id: customTypeModel.id,
				type: ChangeTypes.CUSTOM_TYPE_UPDATE,
				payload: customTypeModel,
			},
		],
		confirmDeleteDocuments: false,
	};

	expect(sentModel).toStrictEqual(expectedAPIPayload);
});

it("pushes changes using the push API to the selected environment when an environment is set", async (ctx) => {
	const customTypeModel = ctx.mockPrismic.model.customType();
	const sharedSliceModel = ctx.mockPrismic.model.sharedSlice();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("custom-type:read", () => {
				return { model: customTypeModel };
			});
			hook("slice:read", () => {
				return { model: sharedSliceModel };
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
	mockSliceMachineAPI(ctx, {
		async onPush(req, res, ctx) {
			if (
				req.headers.get("user-agent") === "slice-machine" &&
				req.headers.get("repository") === "foo"
			) {
				sentModel = await req.json();

				return res(ctx.status(204));
			}
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());

	const authenticationToken = await manager.user.getAuthenticationToken();

	mockAWSACLAPI(ctx, {
		createEndpoint: {
			expectedPrismicRepository: "foo",
			expectedAuthenticationToken: authenticationToken,
		},
	});

	await manager.prismicRepository.pushChanges(
		pushChangesPayload([sharedSliceModel.id], [customTypeModel.id]),
	);

	const expectedAPIPayload: PushBody = {
		changes: [
			{
				id: sharedSliceModel.id,
				type: ChangeTypes.SLICE_INSERT,
				payload: sharedSliceModel,
			},
			{
				id: customTypeModel.id,
				type: ChangeTypes.CUSTOM_TYPE_UPDATE,
				payload: customTypeModel,
			},
		],
		confirmDeleteDocuments: false,
	};

	expect(sentModel).toStrictEqual(expectedAPIPayload);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(async () => {
		await manager.prismicRepository.pushChanges(pushChangesPayload());
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
		await manager.prismicRepository.pushChanges(pushChangesPayload());
	}).rejects.toThrowError(/authenticate before trying again/i);
});
