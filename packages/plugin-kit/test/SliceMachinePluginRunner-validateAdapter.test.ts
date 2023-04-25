import { it, expect } from "vitest";

import * as adapter from "./__fixtures__/adapter";
import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createSliceMachinePluginRunner } from "../src";

const project = createSliceMachineProject(adapter.valid);

it("doesn't throw when adapter is valid", async () => {
	const pluginRunner = createSliceMachinePluginRunner({ project });

	const loadedAdapter = {
		...adapter.valid,
		resolve: adapter.valid,
		options: {},
	};

	// @ts-expect-error - Calling private method
	await pluginRunner._setupPlugin(loadedAdapter, "adapter");

	expect(
		// @ts-expect-error - Calling private method
		() => pluginRunner._validateAdapter(loadedAdapter),
	).not.toThrowError();
});

it("throws when adapter is invalid", async () => {
	const pluginRunner = createSliceMachinePluginRunner({ project });

	const loadedAdapter = {
		...adapter.invalid,
		resolve: adapter.invalid,
		options: {},
	};

	// @ts-expect-error - Calling private method
	await pluginRunner._setupPlugin(loadedAdapter, "adapter");

	expect(
		// @ts-expect-error - Calling private method
		() => pluginRunner._validateAdapter(loadedAdapter),
	).toThrowError(`Adapter \`${adapter.invalid.meta.name}\` is missing hooks:`);
});
