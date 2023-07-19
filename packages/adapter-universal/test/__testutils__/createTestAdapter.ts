import {
	defineSliceMachinePlugin,
	SliceMachinePluginOptions,
	SliceMachinePlugin,
	REQUIRED_ADAPTER_HOOKS,
} from "@slicemachine/plugin-kit";

type CreateTestAdapterArgs<TPluginOptions extends SliceMachinePluginOptions> = {
	name?: string;
	setup?: SliceMachinePlugin<TPluginOptions>["setup"];
};

export const createTestAdapter = <
	TPluginOptions extends SliceMachinePluginOptions,
>(
	args: CreateTestAdapterArgs<TPluginOptions> = {},
): SliceMachinePlugin<TPluginOptions> => {
	return defineSliceMachinePlugin({
		meta: {
			name: args.name || "test-adapter",
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
