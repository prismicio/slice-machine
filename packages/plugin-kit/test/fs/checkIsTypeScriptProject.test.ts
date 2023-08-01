import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { checkIsTypeScriptProject } from "../../src/fs";

it("returns true if the project contains a tsconfig.json file", async (ctx) => {
	await fs.writeFile(path.join(ctx.project.root, "tsconfig.json"), "");

	const res = await checkIsTypeScriptProject({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(true);
});

it("returns false if the project does not contain a tsconfig.json file", async (ctx) => {
	const res = await checkIsTypeScriptProject({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(false);
});
