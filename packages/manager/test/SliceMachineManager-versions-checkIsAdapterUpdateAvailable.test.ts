import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";
import { mockAdapterDirectory } from "./__testutils__/mockAdapterDirectory";

import { createSliceMachineManager } from "../src";

it("returns true if an update is available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	const packageJSON = {
		name: adapter.meta.name,
		version: "1.0.0",
	};

	await mockAdapterDirectory({
		ctx,
		packageJSON,
		adapterName: adapter.meta.name,
	});

	mockNPMRegistryAPI(ctx, {
		packageName: adapter.meta.name,
		versions: ["1.0.0", "2.0.0"],
	});

	const res = await manager.versions.checkIsAdapterUpdateAvailable();

	expect(res).toStrictEqual(true);
});

it("returns false if an update is not available", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	const packageJSON = {
		name: adapter.meta.name,
		version: "1.0.0",
	};

	await mockAdapterDirectory({
		ctx,
		packageJSON,
		adapterName: adapter.meta.name,
	});

	mockNPMRegistryAPI(ctx, {
		packageName: adapter.meta.name,
		versions: ["1.0.0"],
	});

	const res = await manager.versions.checkIsAdapterUpdateAvailable();

	expect(res).toStrictEqual(false);
});
