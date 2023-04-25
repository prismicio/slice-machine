import { expect, it, vi } from "vitest";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";
import { expectHookHandlerToHaveBeenCalledWithData } from "./__testutils__/expectHookHandlerToHaveBeenCalledWithData";
import { watchStd } from "./__testutils__/watchStd";

import { createSliceMachineManager } from "../src";

vi.mock("execa", async () => {
	const execa: typeof import("execa") = await vi.importActual("execa");

	return {
		...execa,
		execaCommand: ((command: string, options: Record<string, unknown>) => {
			// Replace command with simple `echo`
			return execa.execaCommand(`echo 'mock command ran: ${command}'`, options);
		}) as typeof execa.execaCommand,
	};
});

it("runs plugin init hook", async () => {
	const hookHandler = vi.fn();
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();
	await manager.project.initProject();

	expectHookHandlerToHaveBeenCalledWithData(hookHandler, {
		installDependencies: expect.any(Function),
		log: expect.any(Function),
	});
});

it("allows plugin to log things", async () => {
	const hookHandler = vi.fn(({ log }) => {
		log("foo");
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const { stdout } = await watchStd(() => {
		return manager.project.initProject();
	});

	expect(stdout.join("\n")).toMatch(/foo/i);
});

it("allows plugin to install dependencies", async () => {
	const hookHandler = vi.fn(async ({ installDependencies }) => {
		await installDependencies({ dependencies: { express: "^1.0.0" } });
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const { stdout } = await watchStd(() => {
		return manager.project.initProject();
	});

	expect(stdout.join("\n")).toMatch(
		/mock command ran: npm i express@\^1\.0\.0/i,
	);
});

it("supports different logging function", async () => {
	const log = vi.fn();
	const hookHandler = vi.fn(({ log }) => {
		log("foo");
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	const { stdout } = await watchStd(() => {
		return manager.project.initProject({ log });
	});

	expect(stdout.length).toBe(0);
	expect(log).toHaveBeenCalledOnce();
	expect(log).toHaveBeenLastCalledWith(expect.stringMatching(/foo/i));
});

it("throws on plugin error", async () => {
	const hookHandler = vi.fn(() => {
		throw new Error("foo");
	});
	const adapter = createTestPlugin({
		setup: ({ hook }) => {
			hook("project:init", hookHandler);
		},
	});
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await manager.plugins.initPlugins();

	await expect(manager.project.initProject()).rejects.toMatchInlineSnapshot(
		"[SliceMachineError: Failed to initialize project: Error: Error in `test-plugin-c2eeaa5b70ee428d99fd973d06175d73bc4c7bb6` during `project:init` hook: foo]",
	);
});

it("throws if plugins have not been initialized", async () => {
	const cwd = await createTestProject();
	const manager = createSliceMachineManager({ cwd });

	await expect(manager.project.initProject()).rejects.toThrow(
		/plugins have not been initialized/i,
	);
});
