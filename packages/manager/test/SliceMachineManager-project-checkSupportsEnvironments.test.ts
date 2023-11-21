import { expect, it } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns true if the adapter supports environments", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = manager.project.checkSupportsEnvironments();

	expect(res).toBe(true);
});

it("returns false if the adapter does not implement the project:environment:read hook", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:update", () => void 0);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = manager.project.checkSupportsEnvironments();

	expect(res).toBe(false);
});

it("returns false if the adapter does not implement the project:environment:update hook", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = manager.project.checkSupportsEnvironments();

	expect(res).toBe(false);
});
