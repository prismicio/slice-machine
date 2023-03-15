import { HookError, SliceMachinePluginOptions } from "@slicemachine/plugin-kit";
import { detect as niDetect } from "@antfu/ni";

import { VERSION_KIND } from "./constants/VERSION_KIND";

export type PackageManager = NonNullable<Awaited<ReturnType<typeof niDetect>>>;

export type PackageChangelog = {
	currentVersion: string;
	updateAvailable: boolean;
	latestNonBreakingVersion: string | null;
	versions: PackageVersion[];
};

export type PackageVersion = {
	versionNumber: string;
	releaseNote: string | null;
	kind: (typeof VERSION_KIND)[keyof typeof VERSION_KIND] | undefined;
};

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
