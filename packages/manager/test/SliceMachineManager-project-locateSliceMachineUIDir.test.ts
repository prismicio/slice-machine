import { expect, it } from "vitest";
import * as path from "node:path";
import * as fs from "fs/promises";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it.skip("returns the path to the project's Slice Machine UI directory", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const root = await manager.project.getRoot();
	await fs.mkdir(path.join(root, "node_modules", "slice-machine-ui"), {
		recursive: true,
	});
	await fs.writeFile(
		path.join(root, "node_modules", "slice-machine-ui", "package.json"),
		JSON.stringify({
			name: "slice-machine-ui",
		}),
	);

	const sliceMachineUIDir = await manager.project.locateSliceMachineUIDir();

	expect(sliceMachineUIDir).toBe("");
});
