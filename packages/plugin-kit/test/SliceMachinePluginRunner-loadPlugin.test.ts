import { it, expect, vi } from "vitest";

import * as adapter from "./__fixtures__/adapter";
import * as plugin from "./__fixtures__/plugin";
import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createSliceMachinePluginRunner } from "../src";

const project = createSliceMachineProject(adapter.valid);
const pluginRunner = createSliceMachinePluginRunner({ project });

it("loads plugin from module import", async (ctx) => {
	vi.mock(ctx.meta.name, () => ({
		default: plugin.valid,
	}));

	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin(ctx.meta.name);

	expect(loadedPlugin).toMatchInlineSnapshot(`
		{
		  "meta": {
		    "name": "plugin-valid",
		  },
		  "options": {},
		  "resolve": "loads plugin from module import",
		  "setup": [Function],
		}
	`);

	vi.unmock(ctx.meta.name);
});

it("loads plugin from module import with options", async (ctx) => {
	vi.mock(ctx.meta.name, () => ({
		default: plugin.valid,
	}));

	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin({
		resolve: ctx.meta.name,
		options: { foo: "bar" },
	});

	expect(loadedPlugin).toMatchInlineSnapshot(`
		{
		  "meta": {
		    "name": "plugin-valid",
		  },
		  "options": {
		    "foo": "bar",
		  },
		  "resolve": "loads plugin from module import with options",
		  "setup": [Function],
		}
	`);

	vi.unmock(ctx.meta.name);
});

it("loads plugin from direct definition", async () => {
	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin(plugin.valid);

	expect(loadedPlugin).toMatchInlineSnapshot(`
		{
		  "meta": {
		    "name": "plugin-valid",
		  },
		  "options": {},
		  "resolve": {
		    "meta": {
		      "name": "plugin-valid",
		    },
		    "setup": [Function],
		  },
		  "setup": [Function],
		}
	`);
});

it("loads plugin from direct definition with options", async () => {
	// @ts-expect-error - Calling private method
	const loadedPlugin = await pluginRunner._loadPlugin({
		resolve: plugin.valid,
		options: { foo: "bar" },
	});

	expect(loadedPlugin).toMatchInlineSnapshot(`
		{
		  "meta": {
		    "name": "plugin-valid",
		  },
		  "options": {
		    "foo": "bar",
		  },
		  "resolve": {
		    "meta": {
		      "name": "plugin-valid",
		    },
		    "setup": [Function],
		  },
		  "setup": [Function],
		}
	`);
});

it("throws when plugin could not be loaded", async (ctx) => {
	const nonExistentModuleName = ctx.meta.name;

	await expect(
		// @ts-expect-error - Calling private method
		pluginRunner._loadPlugin(nonExistentModuleName),
	).rejects.toThrowError(`Could not load plugin: \`${ctx.meta.name}\``);
});
