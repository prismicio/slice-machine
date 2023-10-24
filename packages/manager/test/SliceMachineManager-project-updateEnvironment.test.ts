import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("calls the adapter's `project:environment:update`", async () => {
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.project.updateEnvironment({ environment: "foo" });

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		environment: "foo",
	});
});

it("supports undefined environment", async () => {
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", () => ({ environment: "foo" }));
			hook("project:environment:update", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.project.updateEnvironment({
		environment: undefined,
	});

	expect(res).toStrictEqual({
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		environment: undefined,
	});
});

it("throws if the adapter does not support environments", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	expect(
		manager.project.updateEnvironment({
			environment: undefined,
		}),
	).rejects.toThrow(/does not support environments/i);
});
