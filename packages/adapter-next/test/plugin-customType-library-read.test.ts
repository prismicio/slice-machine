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
const model1 = mock.model.customType({ id: "foo" });

// Custom Type model to be used in general tests.
const model2 = mock.model.customType({ id: "bar" });

test("returns Slice library data", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model: model1 });
	await ctx.pluginRunner.callHook("custom-type:create", { model: model2 });

	const {
		data: [customTypeLibrary],
	} = await ctx.pluginRunner.callHook("custom-type-library:read", undefined);

	expect(customTypeLibrary).toStrictEqual({
		ids: [model1.id, model2.id].sort(),
	});
});
