import { expect, it } from "vitest";
import * as path from "node:path";
import * as fs from "fs/promises";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it.skip("returns the version of the project's Slice Machine UI", async () => {
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
	const packageJSON = {
		name: "slice-machine-ui",
		version: "999.0.0",
	};
	await fs.writeFile(
		path.join(root, "node_modules", "slice-machine-ui", "package.json"),
		JSON.stringify(packageJSON),
	);

	const version = await manager.project.getRunningSliceMachineVersion();

	expect(version).toBe(packageJSON.version);
});
