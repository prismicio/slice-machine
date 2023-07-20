import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeProjectFile } from "../src";

const filename = "foo.js";

it("writes a file in a project's directory", async (ctx) => {
	const contents = "contents";

	await writeProjectFile({
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, filename),
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

	await writeProjectFile({
		filename,
		contents,
		format: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, filename),
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

	await writeProjectFile({
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const actualContents = await fs.readFile(
		path.join(ctx.project.root, filename),
		"utf8",
	);

	expect(actualContents).toBe(contents);
});

it("returns the path to the saved file", async (ctx) => {
	const contents = "contents";

	const filePath = await writeProjectFile({
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(filePath).toBe(path.join(ctx.project.root, filename));
});
