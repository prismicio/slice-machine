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
		_latest: "_latest",
		apiEndpoint: "apiEndpoint",
		adapter: "adapter",
	};
	await fs.writeFile(
		path.join(project.root, "sm.json"),
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
