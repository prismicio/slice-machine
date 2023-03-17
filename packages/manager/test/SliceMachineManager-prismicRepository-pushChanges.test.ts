import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockCustomTypesAPI } from "./__testutils__/mockCustomTypesAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";
import { BulkBody, ChangeTypes } from "../src/managers/prismicRepository/types";

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

it("pushes changes using the bulk delete API", async (ctx) => {
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
	mockCustomTypesAPI(ctx, {
		async onBulk(req, res, ctx) {
			sentModel = await req.json();

			return res(ctx.status(204));
		},
	});

	await manager.user.login(createPrismicAuthLoginResponse());
	await manager.prismicRepository.pushChanges(
		pushChangesPayload([sharedSliceModel.id], [customTypeModel.id]),
	);

	const expectedAPIPayload: BulkBody = {
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
