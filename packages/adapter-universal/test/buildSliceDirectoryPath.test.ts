import { expect, it } from "vitest";
import * as path from "node:path";

import { buildSliceDirectoryPath } from "../src";

it("returns a relative path to a Slice's directory using its name", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar";

	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(path.join(ctx.project.config.libraries[0], "FooBar"));
});

it("returns an absolute path if configured with `absolute`", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar";

	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(
		path.join(ctx.project.root, ctx.project.config.libraries[0], "FooBar"),
	);
});

it("transforms the Slice's name into pascalcase", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "foo_bar";

	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(path.join(ctx.project.config.libraries[0], "FooBar"));
});

it("supports numbers in Slice names", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar2";

	await ctx.pluginRunner.callHook("slice:create", {
		libraryID: ctx.project.config.libraries[0],
		model,
	});

	const res = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		sliceID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
		actions: ctx.pluginRunner.rawActions,
	});

	expect(res).toBe(path.join(ctx.project.config.libraries[0], "FooBar2"));
});

it("accepts a model in place of sliceID", async (ctx) => {
	const model = ctx.mock.model.sharedSlice();
	model.name = "FooBar";

	const res = await buildSliceDirectoryPath({
		libraryID: ctx.project.config.libraries[0],
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.config.libraries[0], "FooBar"));
});
