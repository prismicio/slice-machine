import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { checkHasProjectFile } from "../../src/fs";

const filename = "foo.js";

it("returns true if the project contains the requested file", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, filename), "");

	const res = await checkHasProjectFile({
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(true);
});

it("returns false if the project does not contain a tsconfig.json file", async (ctx) => {
	const res = await checkHasProjectFile({
		filename,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(false);
});
