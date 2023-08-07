import { expect, it } from "vitest";

it("returns Slice Machine project metadata", async (ctx) => {
	const res = await ctx.pluginRunner.rawHelpers.getProject();

	expect(res).toStrictEqual(ctx.project);
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
