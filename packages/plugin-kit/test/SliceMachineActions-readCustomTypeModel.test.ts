import { it, expect } from "vitest";

import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";
import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";

it("returns Custom Type model", async (ctx) => {
	const model = ctx.mock.model.customType();

	const adapter = createMemoryAdapter({ customTypeModels: [model] });

	await replaceTestAdapter(ctx, { adapter });

	const res = await ctx.pluginRunner.rawActions.readCustomTypeModel({
		id: model.id,
	});

	expect(res).toStrictEqual({ model });
});

it("throws when no Custom Type model is returned", async (ctx) => {
	const adapter = createMemoryAdapter({ customTypeModels: [] });

	await replaceTestAdapter(ctx, { adapter });

	const fn = () =>
		ctx.pluginRunner.rawActions.readCustomTypeModel({ id: "foo" });
	await expect(fn).rejects.toThrowError("Custom type `foo` not found.");
});
