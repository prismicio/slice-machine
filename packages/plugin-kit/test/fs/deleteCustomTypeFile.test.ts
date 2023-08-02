import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { writeCustomTypeFile, deleteCustomTypeFile } from "../../src/fs";

/**
 * !!! DO NOT use this mock factory in tests !!!
 *
 * @remarks
 * Its seed is not specific to be used outside the most general cases.
 */
const mock = createMockFactory({ seed: import.meta.url });
const model = mock.model.sharedSlice();
model.id = "foo_bar";

const filename = "foo.js";

it("deletes a custom type's file", async (ctx) => {
	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	await deleteCustomTypeFile({
		customTypeID: model.id,
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(
		await fs.readdir(path.join(ctx.project.root, "customtypes", model.id)),
	).not.includes(filename);
});

it("returns the path to the deleted file", async (ctx) => {
	await writeCustomTypeFile({
		customTypeID: model.id,
		filename,
		contents: "contents",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await deleteCustomTypeFile({
		customTypeID: model.id,
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join("customtypes", model.id, filename));
});
