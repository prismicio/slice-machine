import { expect, it } from "vitest";
import * as path from "node:path";

it("joins a path relative to the root of the project", async (ctx) => {
	const res = ctx.pluginRunner.rawHelpers.joinPathFromRoot(
		"foo/bar",
		"baz",
		"..",
		"qux",
	);

	expect(res).toBe(path.join(ctx.project.root, "foo", "bar", "qux"));
});
