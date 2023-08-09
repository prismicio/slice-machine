import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeSliceFile, writeSliceModel, renameSlice } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.sharedSlice();
model.name = "FooBar";

const filename = "foo.js";

it("renames a Slice", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		model,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const preDirContents = await fs.readdir(
		path.join(ctx.project.root, ctx.project.config.libraries[0], "FooBar"),
	);

	expect(preDirContents).toStrictEqual([filename, "model.json"]);

	await renameSlice({
		libraryID: ctx.project.config.libraries[0],
		model: {
			...model,
			name: "BazQux",
		},
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const postDirContents = await fs.readdir(
		path.join(ctx.project.root, ctx.project.config.libraries[0], "BazQux"),
	);

	expect(postDirContents).toStrictEqual(preDirContents);
});
