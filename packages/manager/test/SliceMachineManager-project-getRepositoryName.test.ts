import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's repository name", async () => {
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

	const repositoryName = await manager.project.getRepositoryName();

	expect(repositoryName).toEqual(testSliceMachineConfig.repositoryName);
});
