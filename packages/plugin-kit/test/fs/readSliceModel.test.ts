import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";

import {
	buildSliceLibraryDirectoryPath,
	readSliceModel,
	writeSliceFile,
	writeSliceModel,
} from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.sharedSlice();
model.name = "FooBar";

it("returns a Slice's model", async (ctx) => {
	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceModel({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual({ model });
});

it("throws if the Slice library does not exist", async (ctx) => {
	await expect(async () => {
		await readSliceModel({
			libraryID: ctx.project.config.libraries[0],
			sliceID: model.id,
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/did not find a slice model/i);
});

it("throws if the Slice model does not exist", async (ctx) => {
	await fs.mkdir(
		buildSliceLibraryDirectoryPath({
			libraryID: ctx.project.config.libraries[0],
			helpers: ctx.pluginRunner.rawHelpers,
		}),
		{ recursive: true },
	);

	await expect(async () => {
		await readSliceModel({
			libraryID: ctx.project.config.libraries[0],
			sliceID: model.id,
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/did not find a slice model/i);
});

it("throws if the model file cannot be read", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename: "model.json",
		contents: "invalid-json",
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await expect(async () => {
		await readSliceModel({
			libraryID: ctx.project.config.libraries[0],
			sliceID: model.id,
			helpers: ctx.pluginRunner.rawHelpers,
		});
	}).rejects.toThrow(/could not be read/i);
});
