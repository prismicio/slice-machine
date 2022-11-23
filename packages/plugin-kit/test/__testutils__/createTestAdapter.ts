import {
	defineSliceMachinePlugin,
	PluginOptions,
	SliceMachinePlugin,
} from "../../src";
import { REQUIRED_ADAPTER_HOOKS } from "../../src/createSliceMachinePluginRunner";

type CreateTestAdapterArgs<TPluginOptions extends PluginOptions> = {
	setup?: SliceMachinePlugin<TPluginOptions>["setup"];
};

export const createTestAdapter = <TPluginOptions extends PluginOptions>(
	args: CreateTestAdapterArgs<TPluginOptions> = {},
): SliceMachinePlugin<TPluginOptions> => {
	return defineSliceMachinePlugin({
		meta: {
			name: "test",
		},
		setup: async ({ hook, ...restSetupArgs }) => {
			const hookedTypes: string[] = [];

			const spiedOnHook = ((type, ...restHookArgs) => {
				hookedTypes.push(type);

				return hook(type, ...restHookArgs);
			}) as typeof hook;

			await args.setup?.({ hook: spiedOnHook, ...restSetupArgs });

			for (const hookType of REQUIRED_ADAPTER_HOOKS) {
				if (!hookedTypes.includes(hookType)) {
					hook(hookType, () => {
						throw new Error("not implemented");
					});
				}
			}
		},
	});
};
