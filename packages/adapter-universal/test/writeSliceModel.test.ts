import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeSliceModel } from "../src";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.sharedSlice();
model.name = "FooBar";

it("saves a Slice's model", async (ctx) => {
	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"model.json",
		),
		"utf8",
	);

	expect(JSON.parse(contents)).toStrictEqual(model);
});

it("formats contents if `format` is true", async (ctx) => {
	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		format: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"model.json",
		),
		"utf8",
	);

	expect(contents).not.toBe(JSON.stringify(model));
});

it("does not format contents by default", async (ctx) => {
	await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"model.json",
		),
		"utf8",
	);

	expect(contents).toBe(JSON.stringify(model, null, 2));
});

it("returns the path to the saved file", async (ctx) => {
	const filePath = await writeSliceModel({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(filePath).toBe(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"model.json",
		),
	);
});
