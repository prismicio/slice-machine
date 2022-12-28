import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockNPMRegistryAPI } from "./__testutils__/mockNPMRegistryAPI";

import { createSliceMachineManager } from "../src";

it("returns stable Slice Machine versions with kind", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
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

	const res = await manager.versions.getAllStableSliceMachineVersionsWithKind();

	expect(res).toStrictEqual([
		{
			version: "2.0.0",
			kind: "MAJOR",
		},
		{
			version: "1.1.0",
			kind: "MINOR",
		},
		{
			version: "1.0.1",
			kind: "PATCH",
		},
		{
			version: "1.0.0",
			kind: "MAJOR",
		},
		{
			version: "0.2.0",
			kind: "MAJOR",
		},
		{
			version: "0.1.1",
			kind: "PATCH",
		},
		{
			version: "0.1.0",
			kind: "FIRST",
		},
	]);
});
