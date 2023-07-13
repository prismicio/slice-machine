import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockAdapterDirectory } from "./__testutils__/mockAdapterDirectory";

import { createSliceMachineManager } from "../src";

it("returns the version of the project's adapter", async (ctx) => {
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

	const version = await manager.versions.getRunningAdapterVersion();

	expect(version).toBe(packageJSON.version);
});
