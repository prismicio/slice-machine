import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";
import { mockSliceMachineUIDirectory } from "./__testutils__/mockSliceMachineUIDirectory";

import { createSliceMachineManager } from "../src";

it("returns the latest non-breaking Slice Machine version compared to the project's installed version", async (ctx) => {
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

	const res = await manager.versions.getLatestNonBreakingSliceMachineVersion();

	expect(res).toStrictEqual("1.1.0");
});
