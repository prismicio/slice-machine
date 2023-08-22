import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific enough to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });

// Custom Type model to be used in general tests.
const model = mock.model.customType({ id: "foo" });

const assetID = "foo.txt";
const assetData = Buffer.from("data");

test("deletes the Custom Type asset", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });
	await ctx.pluginRunner.callHook("custom-type:asset:update", {
		customTypeID: model.id,
		asset: { id: assetID, data: assetData },
	});

	await ctx.pluginRunner.callHook("custom-type:asset:delete", {
		customTypeID: model.id,
		assetID,
	});

	const { data } = await ctx.pluginRunner.callHook("custom-type:asset:read", {
		customTypeID: model.id,
		assetID,
	});

	expect(data).toStrictEqual([]);
});
