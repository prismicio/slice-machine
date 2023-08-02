import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeFilePath } from "../../src/fs";

it("returns a relative path to a custom type's file", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeFilePath({
		filename: "quux.ext",
		customTypeID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join("customtypes", "foo_bar", "quux.ext"));
});

it("returns an absolute path if configured with `absolute`", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeFilePath({
		filename: "quux.ext",
		customTypeID: model.id,
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(
		path.join(ctx.project.root, "customtypes", "foo_bar", "quux.ext"),
	);
});
