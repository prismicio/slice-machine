import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { joinAppPath } from "../../src/fs";

const filename = "foo.js";

it("joins path from root if `appDirs` directories do not exist", async (ctx) => {
	const res = await joinAppPath(
		{ appDirs: ["src", "app"], helpers: ctx.pluginRunner.rawHelpers },
		filename,
	);

	expect(res).toBe(filename);
});

it("joins path from first `appDirs` directory that exists", async (ctx) => {
	await fs.mkdir(path.join(ctx.project.root, "app"));

	const res = await joinAppPath(
		{ appDirs: ["src", "app"], helpers: ctx.pluginRunner.rawHelpers },
		filename,
	);

	expect(res).toBe(`app${path.sep}${filename}`);
});
