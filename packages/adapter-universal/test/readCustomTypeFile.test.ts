import { expect, it } from "vitest";
import { createMockFactory } from "@prismicio/mock";
import { Buffer } from "node:buffer";

import { readCustomTypeFile, writeCustomTypeFile } from "../src";

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

it("reads a custom type's file", async (ctx) => {
	const contents = "contents";

	await writeCustomTypeFile({
		id: model.id,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readCustomTypeFile({
		id: model.id,
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(Buffer.from(contents));
});

it("encodes the contents if configured with an encoding", async (ctx) => {
	const contents = "contents";

	await writeCustomTypeFile({
		id: model.id,
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readCustomTypeFile({
		id: model.id,
		filename,
		encoding: "utf8",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(contents);
});
