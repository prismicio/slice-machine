import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeProjectFile, deleteProjectFile } from "../../src/fs";

const filename = "foo.js";

it("deletes a project's file", async (ctx) => {
	await writeProjectFile({
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await deleteProjectFile({
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(await fs.readdir(path.join(ctx.project.root))).not.includes(filename);
});

it("returns the path to the deleted file", async (ctx) => {
	await writeProjectFile({
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await deleteProjectFile({
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, filename));
});
