import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";

import { createSliceMachineManager } from "../src";

it("returns the adapter's `project:environment:read` return value", async () => {
	const hookHandler = vi.fn(() => {
		return { environment: "foo" };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.project.readEnvironment();

	expect(res).toStrictEqual({
		environment: "foo",
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, undefined);
});

it("supports undefined returned values", async () => {
	const hookHandler = vi.fn(() => {
		return { environment: undefined };
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const res = await manager.project.readEnvironment();

	expect(res).toStrictEqual({
		environment: undefined,
		errors: [],
	});
	expectHookHandlerToHaveBeenCalledWithData(hookHandler, undefined);
});
