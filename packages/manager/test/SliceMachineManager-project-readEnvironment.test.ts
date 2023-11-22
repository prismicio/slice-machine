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
			hook("project:environment:update", () => void 0);
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
			hook("project:environment:update", () => void 0);
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

it("returns undefined if `project:environment:read`'s return value is the production environment", async () => {
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:environment:read", async () => ({
				environment: await manager.project.getRepositoryName(),
			}));
			hook("project:environment:update", () => void 0);
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
