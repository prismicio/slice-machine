import { expect, it } from "vitest";
import * as path from "node:path";

import { buildSliceFilePath } from "../src";

it("returns a path to a Slice's file", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar";

	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceFilePath({
		filename: "quux.ext",
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"quux.ext",
		),
	);
});

it("transforms the Slice's name into pascalcase", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "foo_bar";

	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceFilePath({
		filename: "quux.ext",
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"quux.ext",
		),
	);
});

it("supports numbers in Slice names", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar2";

	ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceFilePath({
		filename: "quux.ext",
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar2",
			"quux.ext",
		),
	);
});

it("accepts a model in place of sliceID", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar";

	const res = await buildSliceFilePath({
		filename: "quux.ext",
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(
		path.join(
			ctx.project.root,
			ctx.project.config.libraries[0],
			"FooBar",
			"quux.ext",
		),
	);
});
