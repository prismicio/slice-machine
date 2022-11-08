import {
	SliceMachinePlugin,
	SliceMachinePluginOptions,
} from "@slicemachine/plugin-kit";

/**
 * A string, object, or instance representing a registered plugin.
 *
 * @typeParam TSliceMachinePluginOptions - User-provided options for the plugin.
 */
export type SliceMachineConfigPluginRegistration<
	TSliceMachinePluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> =
	| string
	| SliceMachinePlugin
	| {
			resolve: string | SliceMachinePlugin;
			options?: TSliceMachinePluginOptions;
	  };

/**
 * Slice Machine configuration from `slicemachine.config.js`.
 */
export type SliceMachineConfig = {
	// TODO: Is `_latest` necessary? Can we deprecate it?
	_latest: string;
	// TODO: Can we make `apiEndpoint` optional?
	apiEndpoint?: string;
	// NOTE: This is a new property.
	repositoryName: string;
	localSliceSimulatorURL?: string;
	libraries?: string[];
	adapter: SliceMachineConfigPluginRegistration;
	plugins?: SliceMachineConfigPluginRegistration[];
};
