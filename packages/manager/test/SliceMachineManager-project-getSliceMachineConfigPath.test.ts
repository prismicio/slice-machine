import { expect, it } from "vitest";
import * as path from "node:path";
import * as fs from "fs/promises";

import { createTestPlugin } from "./__testutils__/createTestPlugin";
import { createTestProject } from "./__testutils__/createTestProject";

import { createSliceMachineManager } from "../src";

it("returns the project's Slice Machine config path", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	const sliceMachineConfigPath =
		await manager.project.getSliceMachineConfigPath();

	expect(sliceMachineConfigPath).toBe(
		path.join(cwd, "slicemachine.config.json"),
	);
});

it("throws if a config file could not be found", async () => {
	const adapter = createTestPlugin();
	const cwd = await createTestProject({ adapter });
	const manager = createSliceMachineManager({
		nativePlugins: { [adapter.meta.name]: adapter },
		cwd,
	});

	await fs.rm(path.join(cwd, "slicemachine.config.json"));

	await expect(async () => {
		await manager.project.getSliceMachineConfigPath();
	}).rejects.toThrow(/could not find a slicemachine.config.json/i);
});
