import { expect, it } from "vitest";

it("updates Slice Machine project config", async (ctx) => {
	const preProject = await ctx.pluginRunner.rawHelpers.getProject();

	const newConfig = {
		...preProject.config,
		repositoryName: "updatedRepositoryName",
	};

	await ctx.pluginRunner.rawHelpers.updateSliceMachineConfig(newConfig);

	const postProject = await ctx.pluginRunner.rawHelpers.getProject();

	expect(postProject.config).toStrictEqual(newConfig);
});

it("throws on invalid config provided", async (ctx) => {
	await expect(async () => {
		await ctx.pluginRunner.rawHelpers.updateSliceMachineConfig({
			// @ts-expect-error - testing runtime type checking
			repositoryName: null,
		});
	}).rejects.toThrow(/invalid config/i);
});
