import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";
import { mockSliceMachineUIDirectory } from "./__testutils__/mockSliceMachineUIDirectory";

import { createSliceMachineManager } from "../src";

it("returns true if an update is available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({
		ctx,
		packageJSON: { name: "slice-machine-ui", version: "1.0.0" },
	});

	mockNPMRegistryAPI(ctx, {
		packageName: "slice-machine-ui",
		versions: ["1.0.0", "2.0.0"],
	});

	const res = await manager.versions.checkIsSliceMachineUpdateAvailable();

	expect(res).toStrictEqual(true);
});

it("returns false if an update is not available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({
		ctx,
		packageJSON: { name: "slice-machine-ui", version: "1.0.0" },
	});

	mockNPMRegistryAPI(ctx, {
		packageName: "slice-machine-ui",
		versions: ["1.0.0"],
	});

	const res = await manager.versions.checkIsSliceMachineUpdateAvailable();

	expect(res).toStrictEqual(false);
});
