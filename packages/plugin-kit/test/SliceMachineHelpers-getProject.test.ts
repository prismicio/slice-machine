import { expect, it } from "vitest";
import * as fs from "node:fs/promises";
import * as path from "node:path";

it("returns Slice Machine project metadata", async (ctx) => {
	const res = await ctx.pluginRunner.rawHelpers.getProject();

	expect(res).toStrictEqual(ctx.project);
});

it("throws when a config cannot be found", async (ctx) => {
	await fs.rm(path.join(ctx.project.root, "slicemachine.config.json"));

	await expect(
		async () => await ctx.pluginRunner.rawHelpers.getProject(),
	).rejects.toThrowError(/no config found/i);
});

it("throws when a config is invalid", async (ctx) => {
	await fs.writeFile(
		path.join(ctx.project.root, "slicemachine.config.json"),
		JSON.stringify({ repositoryName: null }),
	);

	await expect(
		async () => await ctx.pluginRunner.rawHelpers.getProject(),
	).rejects.toThrowError(/invalid config/i);
});
