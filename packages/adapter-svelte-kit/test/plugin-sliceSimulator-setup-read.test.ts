import { expect, it } from "vitest";

it('returns "Not supported" message', async (ctx) => {
	const res = await ctx.pluginRunner.callHook(
		"slice-simulator:setup:read",
		undefined,
	);

	expect(res.data).toStrictEqual([[]]);
});
