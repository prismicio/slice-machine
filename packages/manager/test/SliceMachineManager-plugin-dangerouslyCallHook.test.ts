import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("calls a given plugin hook", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("debug", (data) => data);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const hookReturnValue = await manager.plugins.dangerouslyCallHook(
		"debug",
		"foo",
	);

	expect(hookReturnValue).toStrictEqual({
		data: ["foo"],
		errors: [],
	});
});
