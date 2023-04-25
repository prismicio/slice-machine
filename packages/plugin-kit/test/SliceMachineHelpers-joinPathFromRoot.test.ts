import { expect, it } from "vitest";
import * as path from "node:path";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("joins a path relative to the root of the project", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = pluginRunner.rawHelpers.joinPathFromRoot(
		"foo/bar",
		"baz",
		"..",
		"qux",
	);
	expect(res).toBe(path.join(project.root, "foo", "bar", "qux"));
});
