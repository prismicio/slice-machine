import {
	defineSliceMachinePlugin,
	SliceMachinePluginOptions,
	SliceMachinePlugin,
	REQUIRED_ADAPTER_HOOKS,
} from "@slicemachine/plugin-kit";
import { expect } from "vitest";
import * as crypto from "node:crypto";

const sha1 = (data: crypto.BinaryLike): string => {
	return crypto.createHash("sha1").update(data).digest("hex");
};

// Use the canonical list from plugin-kit to stay in sync with required hooks

type CreateTestPluginArgs<TPluginOptions extends SliceMachinePluginOptions> =
	Partial<SliceMachinePlugin<TPluginOptions>> & {
		__autofillRequiredAdapterHooks?: boolean;
	};

export const createTestPlugin = <
	TPluginOptions extends SliceMachinePluginOptions,
>({
	setup,
	__autofillRequiredAdapterHooks = true,
	...plugin
}: CreateTestPluginArgs<TPluginOptions> = {}): SliceMachinePlugin<TPluginOptions> => {
	const state = expect.getState();

	return defineSliceMachinePlugin({
		...plugin,
		meta: {
			...plugin.meta,
			name:
				plugin.meta?.name ??
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				`test-plugin-${sha1(state.currentTestName!)}`,
		},
		setup: async ({ hook, ...restSetupArgs }) => {
			const hookedTypes: string[] = [];

			const spiedOnHook = ((type, ...restHookArgs) => {
				hookedTypes.push(type);

				return hook(type, ...restHookArgs);
			}) as typeof hook;

			await setup?.({ hook: spiedOnHook, ...restSetupArgs });

			if (__autofillRequiredAdapterHooks) {
				for (const hookType of REQUIRED_ADAPTER_HOOKS) {
					if (!hookedTypes.includes(hookType)) {
						hook(hookType, () => {
							throw new Error("not implemented");
						});
					}
				}
			}
		},
	});
};
