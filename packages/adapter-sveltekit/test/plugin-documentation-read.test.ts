import { describe, expect, it } from "vitest";

describe("PageSnippet", () => {
	it("returns no documentation", async (ctx) => {
		const model = ctx.mock.model.customType();

		const res = await ctx.pluginRunner.callHook("documentation:read", {
			kind: "PageSnippet",
			data: { model },
		});

		expect(res.data).toStrictEqual([[]]);
	});
});
