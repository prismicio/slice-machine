import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { mockSliceMachineUIDirectory } from "./__testutils__/mockSliceMachineUIDirectory";

import { createSliceMachineManager } from "../src";

it("returns the path to the project's Slice Machine UI directory", async (ctx) => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});
	await mockSliceMachineUIDirectory({ ctx });

	const sliceMachineUIDir = await manager.project.locateSliceMachineUIDir();

	expect(sliceMachineUIDir).toBe(ctx.sliceMachineUIDirectory);
});
