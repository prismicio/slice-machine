import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner, SliceMachineConfig } from "../src";

it("returns Slice Machine project metadata", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);
	project.root = await fs.mkdtemp(
		path.join(os.tmpdir(), "@slicemachine__plugin-kit___"),
	);

	const smJSON: SliceMachineConfig = {
		repositoryName: "repositoryName",
		adapter: "adapter",
	};
	await fs.writeFile(
		path.join(project.root, "slicemachine.config.json"),
		JSON.stringify(smJSON),
	);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const res = await pluginRunner.rawHelpers.getProject();
	expect(res).toStrictEqual({
		...project,
		config: smJSON,
	});

	await fs.rm(project.root, { recursive: true });
});

it("throws when a config cannot be found", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);
	project.root = await fs.mkdtemp(
		path.join(os.tmpdir(), "@slicemachine__plugin-kit___"),
	);

	await fs.writeFile(path.join(project.root, "slicemachine.config.json"), "");

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	expect(() => pluginRunner.rawHelpers.getProject()).rejects.toThrowError(
		/No config found/,
	);

	await fs.rm(project.root, { recursive: true });
});

it("throws when a config is invalid", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);
	project.root = await fs.mkdtemp(
		path.join(os.tmpdir(), "@slicemachine__plugin-kit___"),
	);

	await fs.writeFile(
		path.join(project.root, "slicemachine.config.json"),
		JSON.stringify({}),
	);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	expect(() => pluginRunner.rawHelpers.getProject()).rejects.toThrowError(
		/Invalid config/,
	);
	await fs.rm(project.root, { recursive: true });
});
