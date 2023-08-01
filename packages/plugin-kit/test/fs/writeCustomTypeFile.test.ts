import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeCustomTypeFile } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.customType();
model.id = "foo_bar";

const filename = "foo.js";

it("writes a file in a custom type's directory", async (ctx) => {
	const contents = "contents";

	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, filename),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});

it("formats contents if `format` is true", async (ctx) => {
	const contents = 'const foo = "bar";';

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents,
		format: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, filename),
		"utf8",
	);

	expect(actualContents).toBe('const foo = "bar"\n');
});

it("does not format contents by default", async (ctx) => {
	const contents = 'const foo = "bar";';

	await fs.writeFile(
		path.join(ctx.project.root, ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, "customtypes", model.id, filename),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});

it("returns the path to the saved file", async (ctx) => {
	const contents = "contents";

	const filePath = await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(filePath).toBe(path.join("customtypes", model.id, filename));
});
