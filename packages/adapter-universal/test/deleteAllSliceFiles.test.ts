import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";

import {
	buildSliceDirectoryPath,
	deleteAllSliceFiles,
	writeSliceFile,
	writeSliceModel,
} from "../src";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.sharedSlice();
model.name = "FooBar";

it("deletes all of a Slice's files and directories", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename: "foo.js",
		contents: "",
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const sliceDirectoryPath = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(await fs.readdir(sliceDirectoryPath)).toStrictEqual([
		"foo.js",
		"model.json",
	]);

	await deleteAllSliceFiles({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(fsSync.existsSync(sliceDirectoryPath)).toBe(false);
});
