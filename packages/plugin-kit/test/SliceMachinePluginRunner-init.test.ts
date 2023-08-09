import { it, expect, vi } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import * as plugin from "./__fixtures__/plugin";

import { createSliceMachinePluginRunner } from "../src";

it("inits adapter", async (ctx) => {
	ctx.project.config.adapter = createMemoryAdapter();

	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	// @ts-expect-error - Calling private method
	const loadPlugin = vi.spyOn(pluginRunner, "_loadPlugin");
	// @ts-expect-error - Calling private method
	const setupPlugin = vi.spyOn(pluginRunner, "_setupPlugin");
	// @ts-expect-error - Calling private method
	const validateAdapter = vi.spyOn(pluginRunner, "_validateAdapter");

	await pluginRunner.init();

	expect(loadPlugin).toHaveBeenCalledOnce();
	expect(setupPlugin).toHaveBeenCalledOnce();
	// @ts-expect-error - Issue with Vitest types
	expect(setupPlugin.mock.calls[0][1]).toBe("adapter");
	expect(validateAdapter).toHaveBeenCalledOnce();
});

it("inits plugins", async (ctx) => {
	ctx.project.config.adapter = createMemoryAdapter();
	ctx.project.config.plugins = [plugin.valid, plugin.valid];

	const pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	// @ts-expect-error - Calling private method
	const loadPlugin = vi.spyOn(pluginRunner, "_loadPlugin");
	// @ts-expect-error - Calling private method
	const setupPlugin = vi.spyOn(pluginRunner, "_setupPlugin");
	// @ts-expect-error - Calling private method
	const validateAdapter = vi.spyOn(pluginRunner, "_validateAdapter");

	await pluginRunner.init();

	expect(loadPlugin).toHaveBeenCalledTimes(3);
	expect(setupPlugin).toHaveBeenCalledTimes(3);
	expect(
		// @ts-expect-error - Issue with Vitest types
		setupPlugin.mock.calls.map(([loadedPlugin, as]) => [
			// @ts-expect-error - Issue with Vitest types
			loadedPlugin.meta.name,
			as,
		]),
	).toMatchInlineSnapshot(`
		[
		  [
		    "slicemachine-adapter-memory",
		    "adapter",
		  ],
		  [
		    "plugin-valid",
		    "plugin",
		  ],
		  [
		    "plugin-valid",
		    "plugin",
		  ],
		]
	`);
	expect(validateAdapter).toHaveBeenCalledTimes(1);
});
