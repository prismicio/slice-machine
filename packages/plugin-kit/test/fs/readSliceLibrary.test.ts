import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";

import { readSliceLibrary, writeSliceModel } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model1 = mock.model.sharedSlice();
model1.name = "FooBar";
const model2 = mock.model.sharedSlice();
model2.name = "BazQux";

it("returns a list of Slices in the library", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model1,
	});
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model2,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model2,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceLibrary({
		libraryID: ctx.project.config.libraries[0],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		id: ctx.project.config.libraries[0],
		sliceIDs: [model1.id, model2.id].sort(),
	});
});

it("sorts the list of Slice models", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model2,
	});
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model1,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model2,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceLibrary({
		libraryID: ctx.project.config.libraries[0],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		id: ctx.project.config.libraries[0],
		sliceIDs: [model1.id, model2.id].sort(),
	});
});

it("returns an empty list of Slices if the library does not exist", async (ctx) => {
	const libraryID = "non-existent";

	const res = await readSliceLibrary({
		libraryID,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		id: libraryID,
		sliceIDs: [],
	});
});

it("ignores Slice libraries with invalid models", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model1,
	});
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model: model2,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model1,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const model2Path = await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model: model2,
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	// Overwrite with invalid JSON
	await fs.writeFile(model2Path, "invalid json");

	const res = await readSliceLibrary({
		libraryID: ctx.project.config.libraries[0],
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({
		id: ctx.project.config.libraries[0],
		sliceIDs: [model1.id],
	});
});
