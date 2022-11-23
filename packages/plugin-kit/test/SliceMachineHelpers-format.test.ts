import { expect, it, vi } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";

import { createSliceMachineProject } from "./__testutils__/createSliceMachineProject";
import { createTestAdapter } from "./__testutils__/createTestAdapter";

import { createSliceMachinePluginRunner } from "../src";

it("formats input with Prettier", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const input = "const foo = 'bar'";

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0);

	const res = await pluginRunner.rawHelpers.format(input);
	expect(res).toBe('const foo = "bar";\n');
	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/no parser and no filepath given/i),
	);

	consoleWarnSpy.mockRestore();
});

it("accepts a file path to determine Prettier's parser", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const input = "* List item";
	const filePath = path.join(project.root, "foo.md");

	const res = await pluginRunner.rawHelpers.format(input, filePath);
	expect(res).toBe("- List item\n");
});

it("accepts Prettier options", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const input = "const foo = 'bar'";
	const filePath = "foo.js";

	const res = await pluginRunner.rawHelpers.format(input, filePath, {
		prettier: { semi: false },
	});
	expect(res).toBe('const foo = "bar"\n');
});

it("uses Prettier config file relative to the filepath when it exists", async () => {
	const adapter = createTestAdapter();
	const project = createSliceMachineProject(adapter);
	project.root = await fs.mkdtemp(
		path.join(os.tmpdir(), "@slicemachine__plugin-kit___"),
	);

	const pluginRunner = createSliceMachinePluginRunner({ project });
	await pluginRunner.init();

	const input = "const foo = 'bar'";
	const filePath = path.join(project.root, "foo", "bar", "baz.js");

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(
		path.join(path.dirname(filePath), "..", ".prettierrc"),
		JSON.stringify({ semi: false }),
	);

	const res = await pluginRunner.rawHelpers.format(input, filePath, {
		prettier: {
			semi: false,
		},
	});
	expect(res).toBe('const foo = "bar"\n');

	await fs.rm(project.root, { recursive: true });
});
