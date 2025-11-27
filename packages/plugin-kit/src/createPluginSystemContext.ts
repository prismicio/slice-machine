import { PluginSystemActions } from "./createPluginSystemActions";
import { PluginSystemHelpers } from "./createPluginSystemHelpers";
import { LoadedPlugin } from "./definePlugin";
import { PrismicProject } from "./types";

/**
 * Plugin context shared to plugins and hooks.
 */
export type PluginSystemContext<
	TPluginOptions extends Record<string, unknown>,
> = {
	actions: PluginSystemActions;
	helpers: PluginSystemHelpers;
	project: PrismicProject;
	options: TPluginOptions;
};

/**
 * Arguments for `createPluginSystemContext()`.
 *
 * @typeParam TPluginOptions - Options for the plugin's context.
 */
type CreatePluginSystemContextArgs<
	TPluginOptions extends Record<string, unknown>,
> = {
	actions: PluginSystemActions;
	helpers: PluginSystemHelpers;
	project: PrismicProject;
	plugin: LoadedPlugin<TPluginOptions>;
};

/**
 * Creates Plugin context.
 *
 * @internal
 */
export const createPluginSystemContext = <
	TPluginOptions extends Record<string, unknown>,
>({
	actions,
	helpers,
	project,
	plugin,
}: CreatePluginSystemContextArgs<TPluginOptions>): PluginSystemContext<TPluginOptions> => {
	return {
		actions,
		helpers,
		project,
		options: plugin.options,
	};
};
