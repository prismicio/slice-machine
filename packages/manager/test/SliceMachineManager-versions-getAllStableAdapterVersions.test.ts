import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";

import { createSliceMachineManager } from "../src";

it("returns stable adapter versions", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockNPMRegistryAPI(ctx, {
		packageName: adapter.meta.name,
		versions: [
			"0.0.1",
			"0.1.0",
			"0.1.1",
			"0.2.0",
			"1.0.0",
			"1.0.0-test.0",
			"1.0.1",
			"1.1.0",
			"2.0.0",
		],
	});

	const res = await manager.versions.getAllStableAdapterVersions();

	expect(res).toStrictEqual([
		"2.0.0",
		"1.1.0",
		"1.0.1",
		"1.0.0",
		"0.2.0",
		"0.1.1",
		"0.1.0",
	]);
});
