import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeDirectoryPath } from "../src";

it("returns a relative path to a custom type's directory using its id", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeDirectoryPath({
		customTypeID: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join("customtypes", model.id));
});

it("returns an absolute path if configured with `absolute`", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeDirectoryPath({
		customTypeID: model.id,
		absolute: true,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, "customtypes", model.id));
});
