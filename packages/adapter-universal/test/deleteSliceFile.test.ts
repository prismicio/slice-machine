import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeSliceFile, deleteSliceFile } from "../src";

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

it("deletes a Slice's file", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents: "contents",
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await deleteSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(
		await fs.readdir(
			path.join(ctx.project.root, ctx.project.config.libraries[0], "FooBar"),
		),
	).not.includes(filename);
});

it("returns the path to the deleted file", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents: "contents",
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await deleteSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(
		path.join(ctx.project.config.libraries[0], "FooBar", filename),
	);
});

it("accepts a model in place of sliceID", async (ctx) => {
	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		model,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await deleteSliceFile({
		libraryID: ctx.project.config.libraries[0],
		model,
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(
		await fs.readdir(
			path.dirname(
				path.join(
					ctx.project.root,
					ctx.project.config.libraries[0],
					"FooBar",
					filename,
				),
			),
		),
	).not.includes(filename);
});
