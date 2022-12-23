import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";

import { createSliceMachineManager } from "../src";

it("returns stable Slice Machine versions", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	mockNPMRegistryAPI(ctx, {
		packageName: "slice-machine-ui",
		versions: ["0.0.1", "0.1.0", "1.0.0", "1.0.0-test.0"],
	});

	const res = await manager.versions.getAllStableSliceMachineVersions();

	expect(res).toStrictEqual(["0.1.0", "1.0.0"]);
});
