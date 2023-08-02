import { it, expect } from "vitest";

import * as adapter from "./__fixtures__/adapter";

it("doesn't throw when adapter is valid", async (ctx) => {
	const loadedAdapter = {
		...adapter.valid,
		resolve: adapter.valid,
		options: {},
	};

	// @ts-expect-error - Calling private method
	await ctx.pluginRunner._setupPlugin(loadedAdapter, "adapter");

	expect(
		// @ts-expect-error - Calling private method
		() => ctx.pluginRunner._validateAdapter(loadedAdapter),
	).not.toThrowError();
});

it("throws when adapter is invalid", async (ctx) => {
	const loadedAdapter = {
		...adapter.invalid,
		resolve: adapter.invalid,
		options: {},
	};

	// @ts-expect-error - Calling private method
	await ctx.pluginRunner._setupPlugin(loadedAdapter, "adapter");

	expect(
		// @ts-expect-error - Calling private method
		() => ctx.pluginRunner._validateAdapter(loadedAdapter),
	).toThrowError(`Adapter \`${adapter.invalid.meta.name}\` is missing hooks:`);
});
