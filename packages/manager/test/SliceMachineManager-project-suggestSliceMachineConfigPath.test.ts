import { expect, it } from "vitest";
import path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns a path where the project's Slice Machine configuration could be created based on its package.json location", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.suggestSliceMachineConfigPath();

	expect(root).toBe(path.join(cwd, "slicemachine.config.json"));
});
