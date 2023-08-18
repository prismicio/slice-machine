import { HookError, SliceMachinePluginOptions } from "@slicemachine/plugin-kit";
import { detect as niDetect } from "@antfu/ni";

export type PackageManager = NonNullable<Awaited<ReturnType<typeof niDetect>>>;
export type { APIEndpoints } from "./constants/API_ENDPOINTS";

/**
 * A string, object, or instance representing a registered plugin.
 *
 * @typeParam TSliceMachinePluginOptions - User-provided options for the plugin.
 */
export type SliceMachineConfigPluginRegistration<
	TSliceMachinePluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> =
	| string
	| {
			resolve: string;
			options?: TSliceMachinePluginOptions;
	  };

/**
 * Slice Machine configuration from `slicemachine.config.js`.
 */
export type SliceMachineConfig = {
	// TODO: Can we make `apiEndpoint` optional?
	apiEndpoint?: string;
	// NOTE: This is a new property.
	repositoryName: string;
	localSliceSimulatorURL?: string;
	libraries?: string[];
	adapter: SliceMachineConfigPluginRegistration;
	plugins?: SliceMachineConfigPluginRegistration[];
};

export type OnlyHookErrors<
	THookResult extends
		| { errors: HookError[] }
		| Promise<{ errors: HookError[] }>,
> = Pick<Awaited<THookResult>, "errors">;

export type S3ACL = {
	uploadEndpoint: string;
	requiredFormDataFields: Record<string, string>;
	imgixEndpoint: string;
};
