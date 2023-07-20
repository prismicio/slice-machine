import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeLibraryDirectoryPath } from "../src";

it("returns a relative path to the custom type library' directory", async (ctx) => {
	const res = buildCustomTypeLibraryDirectoryPath({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe("customtypes");
});

it("returns an absolute path if configured with `absolute`", async (ctx) => {
	const res = buildCustomTypeLibraryDirectoryPath({
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, "customtypes"));
});
