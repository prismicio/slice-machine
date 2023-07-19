import { expect, it } from "vitest";
import * as path from "node:path";

import { buildCustomTypeDirectoryPath } from "../src";

it("returns a path to a custom type's directory using its id", async (ctx) => {
	const model = ctx.mock.model.customType();
	model.id = "foo_bar";

	const res = buildCustomTypeDirectoryPath({
		id: model.id,
		helpers: ctx.pluginRunner.rawHelpers,
	});

	expect(res).toBe(path.join(ctx.project.root, "customtypes", model.id));
});
