import { expect, it } from "vitest";
import { Buffer } from "node:buffer";

import { readProjectFile, writeProjectFile } from "../../src/fs";

const filename = "foo.js";

it("reads a project's file", async (ctx) => {
	const contents = "contents";

	await writeProjectFile({
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readProjectFile({
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(Buffer.from(contents));
});

it("encodes the contents if configured with an encoding", async (ctx) => {
	const contents = "contents";

	await writeProjectFile({
		filename,
		contents,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	const res = await readProjectFile({
		filename,
		encoding: "utf8",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toStrictEqual(contents);
});
