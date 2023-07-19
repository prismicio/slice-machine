import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeLibraryDirectoryPath } from "../src";

it("returns a path to the custom type library' directory", async (ctx) => {
	const res = buildCustomTypeLibraryDirectoryPath({
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, "customtypes"));
});
