import { SliceMachineActions } from "./createSliceMachineActions";
import { SliceMachineHelpers } from "./createSliceMachineHelpers";
import { LoadedSliceMachinePlugin } from "./defineSliceMachinePlugin";
import { SliceMachineProject } from "./types";

/**
 * Slice Machine context shared to plugins and hooks.
 */
export type SliceMachineContext<
	TPluginOptions extends Record<string, unknown>,
> = {
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
	project: SliceMachineProject;
	options: TPluginOptions;
};

/**
 * Arguments for `createSliceMachineContext()`.
 *
 * @typeParam TPluginOptions - Options for the plugin's context.
 */
type CreateSliceMachineContextArgs<
	TPluginOptions extends Record<string, unknown>,
> = {
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
	project: SliceMachineProject;
	plugin: LoadedSliceMachinePlugin<TPluginOptions>;
};

/**
 * Creates Slice Machine context.
 *
 * @internal
 */
export const createSliceMachineContext = <
	TPluginOptions extends Record<string, unknown>,
>({
	actions,
	helpers,
	project,
	plugin,
}: CreateSliceMachineContextArgs<TPluginOptions>): SliceMachineContext<TPluginOptions> => {
	return {
		actions,
		helpers,
		project,
		options: plugin.options,
	};
};
