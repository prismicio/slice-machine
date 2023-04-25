import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockSliceMachineUIDirectory } from "./__testutils__/mockSliceMachineUIDirectory";

import { createSliceMachineManager } from "../src";

it("returns the version of the project's Slice Machine UI", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const packageJSON = {
		name: "slice-machine-ui",
		version: "1.0.0",
	};

	await mockSliceMachineUIDirectory({ ctx, packageJSON });

	const version = await manager.versions.getRunningSliceMachineVersion();

	expect(version).toBe(packageJSON.version);
});
