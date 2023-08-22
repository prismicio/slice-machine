import { it, expect } from "vitest";

import { replaceTestAdapter } from "./__testutils__/replaceTestAdapter";
import { createMemoryAdapter } from "./__testutils__/createMemoryAdapter";

it("returns all Custom Type models", async (ctx) => {
	const customTypeModels = [
		ctx.mock.model.customType(),
		ctx.mock.model.customType(),
	];

	const adapter = createMemoryAdapter({ customTypeModels });

	await replaceTestAdapter(ctx, { adapter });

	const res = await ctx.pluginRunner.rawActions.readAllCustomTypeModels();

	expect(res).toStrictEqual(
		customTypeModels.map((model) => {
			return { model };
		}),
	);
});

it("returns empty array when project has no Custom Types", async (ctx) => {
	const adapter = createMemoryAdapter({ customTypeModels: [] });

	await replaceTestAdapter(ctx, { adapter });

	const res = await ctx.pluginRunner.rawActions.readAllCustomTypeModels();

	expect(res).toStrictEqual([]);
});
