import { test, expect } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";
import * as fs from "node:fs/promises";
import * as path from "node:path";

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

test("writes a new Custom Type asset", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });
	await ctx.pluginRunner.callHook("custom-type:asset:update", {
		customTypeID: model.id,
		asset: { id: assetID, data: assetData },
	});

	expect(
		await fs.readFile(
			path.join(ctx.project.root, "customtypes", model.id, assetID),
		),
	).toStrictEqual(assetData);
});

test("updates an existing Custom Type asset", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", { model });
	await ctx.pluginRunner.callHook("custom-type:asset:update", {
		customTypeID: model.id,
		asset: { id: assetID, data: assetData },
	});

	const newAssetData = Buffer.from("new data");
	await ctx.pluginRunner.callHook("custom-type:asset:update", {
		customTypeID: model.id,
		asset: { id: assetID, data: newAssetData },
	});

	expect(
		await fs.readFile(
			path.join(ctx.project.root, "customtypes", model.id, assetID),
		),
	).toStrictEqual(newAssetData);
});
