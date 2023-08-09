import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import prettier from "prettier";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeCustomTypeModel } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType();
model.id = "foo_bar";

it("saves a custom type's model", async (ctx) => {
	await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(JSON.parse(contents)).toStrictEqual(model);
});

it("formats contents if `format` is true", async (ctx) => {
	const prettierConfig = { useTabs: true };

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify(prettierConfig),
	);

	await writeCustomTypeModel({
		model,
		format: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(contents).toBe(
		prettier.format(JSON.stringify(model, null, 2), {
			...prettierConfig,
			parser: "json",
		}),
	);
});

it("accepts format options", async (ctx) => {
	const prettierConfig = { useTabs: true };

	await writeCustomTypeModel({
		model,
		format: true,
		formatOptions: {
			prettier: prettierConfig,
		},
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(contents).toBe(
		prettier.format(JSON.stringify(model, null, 2), {
			...prettierConfig,
			parser: "json",
		}),
	);
});

it("does not format contents by default", async (ctx) => {
	const prettierConfig = { useTabs: true };

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify(prettierConfig),
	);

	await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const contents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, "index.json"),
		"utf8",
	);

	expect(contents).not.toBe(
		prettier.format(JSON.stringify(model, null, 2), {
			...prettierConfig,
			parser: "json",
		}),
	);
});

it("returns the path to the saved file", async (ctx) => {
	const filePath = await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(filePath).toBe(path.join("customtypes", model.id, "index.json"));
});
