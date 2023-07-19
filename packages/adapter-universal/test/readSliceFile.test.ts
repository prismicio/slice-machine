import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";

import { readSliceFile, writeSliceFile } from "../src";

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

it("reads a Slice's file", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const contents = "contents";

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(Buffer.from(contents));
});

it("encodes the contents if configured with an encoding", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const contents = "contents";

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		encoding: "utf8",
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(contents);
});

it("accepts a model in place of sliceID", async (ctx) => {
	const contents = "contents";

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		model,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readSliceFile({
		libraryID: ctx.project.config.libraries[0],
		model,
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(Buffer.from(contents));
});
