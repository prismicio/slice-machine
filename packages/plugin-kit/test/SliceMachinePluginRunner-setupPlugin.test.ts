import { it, expect } from "vitest";

import * as adapter from "./__fixtures__/adapter";
import * as plugin from "./__fixtures__/plugin";

import { REQUIRED_ADAPTER_HOOKS, ADAPTER_ONLY_HOOKS } from "../src";

it("throws when plugin throws on setup", async (ctx) => {
	// Throws anything
	await expect(async () => {
		// @ts-expect-error - Calling private method
		await ctx.pluginRunner._setupPlugin(
			{
				...plugin.throwAny,
				resolve: plugin.throwAny,
				options: {},
			},
			"plugin",
		);
	}).rejects.toThrowError(
		`Plugin \`${plugin.throwAny.meta.name}\` errored during setup: ${plugin.throwAny.meta.name}`,
	);

	// Throws an instance of Error
	await expect(async () => {
		// @ts-expect-error - Calling private method
		await ctx.pluginRunner._setupPlugin(
			{
				...plugin.throwError,
				resolve: plugin.throwAny,
				options: {},
			},
			"plugin",
		);
	}).rejects.toThrowError(
		`Plugin \`${plugin.throwError.meta.name}\` errored during setup: ${plugin.throwError.meta.name}`,
	);
});

it("allows plugin setup as adapter to hook to adapter only hooks", async (ctx) => {
	// @ts-expect-error - Calling private method
	await ctx.pluginRunner._setupPlugin(
		{
			...adapter.valid,
			resolve: adapter.valid,
			options: {},
		},
		"adapter",
	);
	expect(
		ctx.pluginRunner
			.hooksForOwner(adapter.valid.meta.name)
			.map((hook) => hook.meta.type)
			.sort(),
	).toStrictEqual(REQUIRED_ADAPTER_HOOKS.sort());
});

it("prevents plugin setup as plugin to hook to adapter only hooks", async (ctx) => {
	// @ts-expect-error - Calling private method
	await ctx.pluginRunner._setupPlugin(
		{
			...adapter.valid,
			resolve: adapter.valid,
			options: {},
		},
		"plugin",
	);
	expect(
		ctx.pluginRunner
			.hooksForOwner(adapter.valid.meta.name)
			.map((hook) => hook.meta.type)
			.sort(),
	).toStrictEqual(
		REQUIRED_ADAPTER_HOOKS.filter(
			(type) => !ADAPTER_ONLY_HOOKS.includes(type),
		).sort(),
	);
});
