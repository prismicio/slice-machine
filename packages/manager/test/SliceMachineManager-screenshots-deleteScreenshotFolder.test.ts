import { expect, it } from "vitest";

import { createPrismicAuthLoginResponse } from "./__testutils__/createPrismicAuthLoginResponse";
import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAWSACLAPI } from "./__testutils__/mockAWSACLAPI";
import { mockPrismicAuthAPI } from "./__testutils__/mockPrismicAuthAPI";
import { mockPrismicUserAPI } from "./__testutils__/mockPrismicUserAPI";

import { createSliceMachineManager } from "../src";

it("deletes a screenshot folder from S3", async (ctx) => {
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

	mockAWSACLAPI(ctx, {
		deleteFolderEndpoint: { expectedSliceIDs: ["6DMD8c7iweHQ8F9mtC5ho"] },
	});

	await expect(
		manager.screenshots.deleteScreenshotFolder({
			sliceID: "6DMD8c7iweHQ8F9mtC5ho",
		}),
	).resolves.toBeUndefined();
});

it("throws if the folder deletion was unsuccessful", async (ctx) => {
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

	mockAWSACLAPI(ctx, {
		deleteFolderEndpoint: { expectedSliceIDs: ["6DMD8c7iweHQ8F9mtC5ho"] },
	});

	await expect(
		manager.screenshots.deleteScreenshotFolder({
			sliceID: "yeoOt6laxWwzMAXJvxxfV",
		}),
	).rejects.toThrow(/Unable to delete screenshot folder/i);
});
