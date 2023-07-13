import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's adapter namer", async () => {
	const adapter = createTestPlugin();
	const testSliceMachineConfig = {
		repositoryName: "bar",
		apiEndpoint: "baz",
		adapter,
		libraries: ["./qux"],
		localSliceSimulatorURL: "quux",
		plugins: ["corge"],
	};
	const cwd = await createTestProject(testSliceMachineConfig);
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const adapterName = await manager.project.getAdapterName();

	expect(adapterName).toEqual(adapter.meta.name);
});
