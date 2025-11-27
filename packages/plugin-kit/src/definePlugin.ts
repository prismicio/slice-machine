import { CreateScopeReturnType } from "./lib/HookSystem";
import { PluginSystemContext } from "./createPluginSystemContext";
import { PluginOptions, PluginHookExtraArgs, PluginHooks } from "./types";

/**
 * Plugin definition.
 */
export type Plugin<
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
		context: Omit<PluginSystemContext<TPluginOptions>, "actions"> &
			Pick<
				CreateScopeReturnType<PluginHooks, PluginHookExtraArgs<TPluginOptions>>,
				"hook" | "unhook"
			>,
	) => void | Promise<void>;
};

/**
 * @internal
 */
export type LoadedPlugin<TPluginOptions extends PluginOptions = PluginOptions> =
	Plugin<TPluginOptions> & {
		resolve: string | Plugin;
		options: TPluginOptions;
	};

export const definePlugin = <
	TPluginOptions extends PluginOptions = PluginOptions,
>(
	plugin: Plugin<TPluginOptions>,
): Plugin<TPluginOptions> => plugin;
