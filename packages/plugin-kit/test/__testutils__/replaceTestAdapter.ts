import { TestContext } from "vitest";

import { createSliceMachinePluginRunner, SliceMachinePlugin } from "../../src";

type ReplaceTestAdapterConfig = {
	adapter: SliceMachinePlugin;
};

export async function replaceTestAdapter(
	ctx: TestContext,
	config: ReplaceTestAdapterConfig,
): Promise<void> {
	ctx.project.config.adapter = config.adapter;

	ctx.pluginRunner = createSliceMachinePluginRunner({ project: ctx.project });

	await ctx.pluginRunner.init();
}
