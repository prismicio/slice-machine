import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Custom Type model to be used in general tests.
const model = mock.model.customType({ id: "foo" });

test("returns the Custom Type model", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });

	const {
		data: [resModel],
	} = await ctx.pluginRunner.callHook("custom-type:read", { id: model.id });

	expect(resModel).toStrictEqual({ model });
});
