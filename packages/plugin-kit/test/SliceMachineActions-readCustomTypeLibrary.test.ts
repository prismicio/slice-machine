import { it, expect } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import { createTestAdapter } from "./__testutils__/createTestAdapter";
import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";

it("returns the Custom Type library", async (ctx) => {
	const customTypeModels = [
		ctx.mock.model.customType(),
		ctx.mock.model.customType(),
	];

	const adapter = createMemoryAdapter({ customTypeModels });

	await replaceTestAdapter(ctx, { adapter });

	const res = await ctx.pluginRunner.rawActions.readCustomTypeLibrary();

	expect(res).toStrictEqual({
		ids: customTypeModels.map((model) => {
			return model.id;
		}),
	});
});

it("throws when no Custom Type library is returned", async (ctx) => {
	const adapter = createTestAdapter();

	await replaceTestAdapter(ctx, { adapter });

	const fn = () => ctx.pluginRunner.rawActions.readCustomTypeLibrary();
	await expect(fn).rejects.toThrowError("Couldn't read custom type library.");
});
