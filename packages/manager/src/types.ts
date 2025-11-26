import { HookError, SliceMachinePluginOptions } from "@prismicio/plugin-kit";
import { detect as niDetect } from "@antfu/ni";

export type PackageManager = NonNullable<Awaited<ReturnType<typeof niDetect>>>;
export type { APIEndpoints } from "./constants/API_ENDPOINTS";

/**
 * A string, object, or instance representing a registered plugin.
 *
 * @typeParam TSliceMachinePluginOptions - User-provided options for the plugin.
 */
export type PrismicConfigPluginRegistration<
	TSliceMachinePluginOptions extends
		SliceMachinePluginOptions = SliceMachinePluginOptions,
> =
	| string
	| {
			resolve: string;
			options?: TSliceMachinePluginOptions;
	  };

/**
 * Prismic configuration from `prismic.config.js`.
 */
export type PrismicConfig = {
	apiEndpoint?: string;
	repositoryName: string;
	libraries?: string[];
	adapter: PrismicConfigPluginRegistration;
	plugins?: PrismicConfigPluginRegistration[];
	labs?: { legacySliceUpgrader?: boolean };
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
