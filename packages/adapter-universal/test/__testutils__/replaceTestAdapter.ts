import {
	createSliceMachinePluginRunner,
	SliceMachinePlugin,
} from "@slicemachine/plugin-kit";
import { TestContext } from "vitest";

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
