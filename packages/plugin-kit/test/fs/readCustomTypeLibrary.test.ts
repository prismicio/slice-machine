import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import {
	buildCustomTypeLibraryDirectoryPath,
	readCustomTypeLibrary,
	writeCustomTypeModel,
} from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model1 = mock.model.customType();
model1.id = "foo";
const model2 = mock.model.customType();
model2.id = "bar";

it("returns a list of custom types in the library", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model1,
	});
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model2,
	});

	await writeCustomTypeModel({
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeCustomTypeModel({
		model: model2,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readCustomTypeLibrary({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		ids: [model1.id, model2.id].sort(),
	});
});

it("sorts the list of custom types in the library", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model2,
	});
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model1,
	});

	await writeCustomTypeModel({
		model: model2,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeCustomTypeModel({
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readCustomTypeLibrary({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		ids: [model1.id, model2.id].sort(),
	});
});

it("returns an empty list of custom types if the library does not exist", async (ctx) => {
	const res = await readCustomTypeLibrary({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		ids: [],
	});
});

it("ignores non-custom type folders in the library", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model1,
	});

	await writeCustomTypeModel({
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const customTypeLibraryDiractoryPath = buildCustomTypeLibraryDirectoryPath({
		helpers: ctx.pluginRunner.rawHelpers,
		absolute: true,
	});
	await fs.mkdir(path.join(customTypeLibraryDiractoryPath, model2.id), {
		recursive: true,
	});

	const childDirs = await fs.readdir(customTypeLibraryDiractoryPath);
	const res = await readCustomTypeLibrary({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(childDirs.sort()).toStrictEqual([model1.id, model2.id].sort());
	expect(res).toStrictEqual({
		ids: [model1.id].sort(),
	});
});

it("throws if an invalid model is found", async (ctx) => {
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model1,
	});
	await ctx.pluginRunner.callHook("custom-type:create", {
		model: model2,
	});

	await writeCustomTypeModel({
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const model2Path = await writeCustomTypeModel({
		model: model2,
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	// Overwrite with invalid JSON
	await fs.writeFile(model2Path, "invalid json");

	await expect(async () => {
		await readCustomTypeLibrary({
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/could not be read/);
});
