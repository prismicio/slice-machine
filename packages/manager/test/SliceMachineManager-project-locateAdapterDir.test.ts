import { expect, it } from "vitest";
import path from "node:path";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAdapterDirectory } from "./__testutils__/mockAdapterDirectory";
import { MOCK_BASE_DIRECTORY } from "./__setup__";

import { createSliceMachineManager } from "../src";

it("returns the path to the project's adapter directory", async (ctx) => {
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

	const adapterDir = await manager.project.locateAdapterDir();

	expect(adapterDir).toBe(
		path.dirname(`${MOCK_BASE_DIRECTORY}/${adapter.meta.name}/package.json`),
	);
});
