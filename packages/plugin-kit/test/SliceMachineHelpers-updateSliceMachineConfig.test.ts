import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner, SliceMachineConfig } from "../src";

it("updates Slice Machine project config", async () => {
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

	const updatedSMJSON: SliceMachineConfig = {
		repositoryName: "updatedRepositoryName",
		adapter: "updatedAdapter",
	};
	await pluginRunner.rawHelpers.updateSliceMachineConfig(updatedSMJSON, {
		format: true,
	});

	const updatedRes = await pluginRunner.rawHelpers.getProject();

	expect(updatedRes).toStrictEqual({
		...project,
		config: updatedSMJSON,
	});

	await fs.rm(project.root, { recursive: true });
});

it("throws on invalid config provided", async () => {
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

	expect(() =>
		// @ts-expect-error - testing runtime type checking
		pluginRunner.rawHelpers.updateSliceMachineConfig({ repositoryName: null }),
	).rejects.toThrowError(/Invalid config/);

	await fs.rm(project.root, { recursive: true });
});
