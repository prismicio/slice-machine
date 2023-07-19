import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeFilePath } from "../src";

it("returns a path to a custom type's file", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeFilePath({
		filename: "quux.ext",
		id: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(
		path.join(ctx.project.root, "customtypes", "foo_bar", "quux.ext"),
	);
});
