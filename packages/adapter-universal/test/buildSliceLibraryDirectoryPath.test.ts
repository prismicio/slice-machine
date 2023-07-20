import { expect, it } from "vitest";
import * as path from "node:path";

import { buildSliceLibraryDirectoryPath } from "../src";

it("returns a relative path to a Slice library's directory using its ID", async (ctx) => {
	const res = buildSliceLibraryDirectoryPath({
		libraryID: "./slices",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe("slices");
});

it("returns an absolute path if configured with `absolute`", async (ctx) => {
	const res = buildSliceLibraryDirectoryPath({
		libraryID: "./slices",
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, "slices"));
});

it("supports directories above the root", async (ctx) => {
	const res = buildSliceLibraryDirectoryPath({
		libraryID: "../slices",
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join("..", "slices"));
});
