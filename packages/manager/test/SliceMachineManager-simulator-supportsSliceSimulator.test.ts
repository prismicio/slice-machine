import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns `true` if Slice Simulator is supported", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("slice-simulator:setup:read", () => {
				return [
					{
						title: "valid",
						description: "valid desc",
						body: "foo",
						validate: async () => void 0,
					},
					{
						title: "invalid-one-error",
						description: "invalid-one-error desc",
						body: "bar",
						validate: async () => {
							return { title: "title", message: "message" };
						},
					},
					{
						title: "invalid-multiple-errors",
						description: "invalid-multiple-errors desc",
						body: "baz",
						validate: async () => {
							return [
								{ title: "title1", message: "message1" },
								{ title: "title2", message: "message2" },
							];
						},
					},
					{
						title: "no-validator",
						description: "no-validator desc",
						body: "qux",
					},
				];
			});
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	expect(manager.simulator.supportsSliceSimulator()).toBe(true);
});

it("returns `false` if Slice Simulator is not supported", async () => {
	const adapter = createTestPlugin({
		setup: () => {
			/* ... */
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	expect(manager.simulator.supportsSliceSimulator()).toBe(false);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	expect(() => manager.simulator.supportsSliceSimulator()).toThrow(
		/plugins have not been initialized/i,
	);
});
