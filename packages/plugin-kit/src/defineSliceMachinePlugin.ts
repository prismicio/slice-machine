import { CreateScopeReturnType } from "./lib/HookSystem";
import { SliceMachineContext } from "./createSliceMachineContext";
import {
	SliceMachinePluginOptions,
	SliceMachineHookExtraArgs,
	SliceMachineHooks,
} from "./types";

/**
 * Slice Machine plugin definition.
 */
export type SliceMachinePlugin<
	TPluginOptions extends Record<string, unknown> = Record<string, unknown>,
> = {
	/**
	 * Information about the plugin.
	 */
	meta: {
		name: string;
	};

	/**
	 * Default options.
	 */
	defaultOptions?: TPluginOptions;

	/**
	 * Plugin setup.
	 */
	setup: (
		context: Omit<SliceMachineContext<TPluginOptions>, "actions"> &
			Pick<
				CreateScopeReturnType<
					SliceMachineHooks,
					SliceMachineHookExtraArgs<TPluginOptions>
				>,
				"hook" | "unhook"
			>,
	) => void | Promise<void>;
};

/**
 * @internal
 */
export type LoadedSliceMachinePlugin<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = SliceMachinePlugin<TPluginOptions> & {
	resolve: string | SliceMachinePlugin;
	options: TPluginOptions;
};

export const defineSliceMachinePlugin = <
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
>(
	plugin: SliceMachinePlugin<TPluginOptions>,
): SliceMachinePlugin<TPluginOptions> => plugin;
