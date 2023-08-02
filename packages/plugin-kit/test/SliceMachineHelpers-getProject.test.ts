import { expect, it } from "vitest";

it("returns Slice Machine project metadata", async (ctx) => {
	const res = await ctx.pluginRunner.rawHelpers.getProject();

	expect(res).toStrictEqual(ctx.project);
});
