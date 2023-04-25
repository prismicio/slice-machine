import { it, expect } from "vitest";

import * as adapter from "./__fixtures__/adapter";
import * as plugin from "./__fixtures__/plugin";
import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";

import { createSliceMachinePluginRunner } from "../src";
import {
	REQUIRED_ADAPTER_HOOKS,
	ADAPTER_ONLY_HOOKS,
} from "../src/createSliceMachinePluginRunner";

const project = createSliceMachineProject(adapter.valid);
const pluginRunner = createSliceMachinePluginRunner({ project });

it("throws when plugin throws on setup", async () => {
	// Throws anything
	await expect(
		// @ts-expect-error - Calling private method
		pluginRunner._setupPlugin(
			{
				...plugin.throwAny,
				resolve: plugin.throwAny,
				options: {},
			},
			"plugin",
		),
	).rejects.toThrowError(
		`Plugin \`${plugin.throwAny.meta.name}\` errored during setup: ${plugin.throwAny.meta.name}`,
	);

	// Throws an instance of Error
	await expect(
		// @ts-expect-error - Calling private method
		pluginRunner._setupPlugin(
			{
				...plugin.throwError,
				resolve: plugin.throwAny,
				options: {},
			},
			"plugin",
		),
	).rejects.toThrowError(
		`Plugin \`${plugin.throwError.meta.name}\` errored during setup: ${plugin.throwError.meta.name}`,
	);
});

it("allows plugin setup as adapter to hook to adapter only hooks", async () => {
	const pluginRunner = createSliceMachinePluginRunner({ project });

	// @ts-expect-error - Calling private method
	await pluginRunner._setupPlugin(
		{
			...adapter.valid,
			resolve: adapter.valid,
			options: {},
		},
		"adapter",
	);
	expect(
		pluginRunner
			.hooksForOwner(adapter.valid.meta.name)
			.map((hook) => hook.meta.type),
	).toStrictEqual(REQUIRED_ADAPTER_HOOKS);
});

it("prevents plugin setup as plugin to hook to adapter only hooks", async () => {
	const pluginRunner = createSliceMachinePluginRunner({ project });

	// @ts-expect-error - Calling private method
	await pluginRunner._setupPlugin(
		{
			...adapter.valid,
			resolve: adapter.valid,
			options: {},
		},
		"plugin",
	);
	expect(
		pluginRunner
			.hooksForOwner(adapter.valid.meta.name)
			.map((hook) => hook.meta.type),
	).toStrictEqual(
		REQUIRED_ADAPTER_HOOKS.filter((type) => !ADAPTER_ONLY_HOOKS.includes(type)),
	);
});
