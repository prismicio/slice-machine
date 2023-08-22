import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";

import {
	readCustomTypeModel,
	writeCustomTypeFile,
	writeCustomTypeModel,
} from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType();
model.id = "foo_bar";

it("returns a custom type's model", async (ctx) => {
	await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readCustomTypeModel({
		customTypeID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ model });
});

it("throws if the custom type model does not exist", async (ctx) => {
	await expect(async () => {
		await readCustomTypeModel({
			customTypeID: model.id,
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/no such file or directory/i);
});

it("throws if the model file cannot be read", async (ctx) => {
	await writeCustomTypeFile({
		customTypeID: model.id,
		filename: "model.json",
		contents: "invalid-json",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await expect(async () => {
		await readCustomTypeModel({
			customTypeID: model.id,
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/no such file or directory/i);
});
