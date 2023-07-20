import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as fsSync from "node:fs";
import * as path from "node:path";

import {
	deleteAllCustomTypeFiles,
	writeCustomTypeFile,
	writeCustomTypeModel,
} from "../src";

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

it("deletes all of a Slice's files and directories", async (ctx) => {
	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await writeCustomTypeModel({
		model,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const customTypeDirectoryPath = path.join(
		ctx.project.root,
		"customtypes",
		model.id,
	);

	expect(await fs.readdir(customTypeDirectoryPath)).toStrictEqual([
		"foo.js",
		"index.json",
	]);

	await deleteAllCustomTypeFiles({
		customTypeID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(fsSync.existsSync(customTypeDirectoryPath)).toBe(false);
});

it("returns the path to the delete directory", async (ctx) => {
	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await deleteAllCustomTypeFiles({
		customTypeID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join("customtypes", model.id));
});
