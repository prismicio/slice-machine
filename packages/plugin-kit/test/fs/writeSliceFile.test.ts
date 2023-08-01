import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeSliceFile } from "../../src/fs";

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

it("writes a file in a Slice's directory", async (ctx) => {
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

	const actualContents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			filename,
		),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});

it("formats contents if `format` is true", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const contents = 'const foo = "bar";';

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents,
		format: true,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			filename,
		),
		"utf8",
	);

	expect(actualContents).toBe('const foo = "bar"\n');
});

it("does not format contents by default", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const contents = 'const foo = "bar";';

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			filename,
		),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});

it("returns the path to the saved file", async (ctx) => {
	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const contents = 'const foo = "bar";';

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	const filePath = await writeSliceFile({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		filename,
		contents,
		format: false,
		actions: ctx.pluginRunner.rawActions,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(filePath).toBe(
		path.join(ctx.project.config.libraries[0], "FooBar", filename),
	);
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

	const actualContents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			filename,
		),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});
