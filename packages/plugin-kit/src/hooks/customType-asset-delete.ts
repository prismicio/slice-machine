import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `custom-type:asset:delete` hook handlers.
 */
export type CustomTypeAssetDeleteHookData = {
	customTypeID: string;
	assetID: string;
};

/**
 * Return value for `custom-type:asset:delete` hook handlers.
 */
export type CustomTypeAssetDeleteHookReturnType = void;

/**
 * Base version of `custom-type:asset:delete` without plugin runner context.
 *
 * @internal
 */
export type CustomTypeAssetDeleteHookBase = PluginHook<
	CustomTypeAssetDeleteHookData,
	CustomTypeAssetDeleteHookReturnType
>;

/**
 * Handler for the `custom-type:asset:delete` hook. The hook is called when a
 * Custom Type asset is deleted.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeAssetDeleteHook<
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<CustomTypeAssetDeleteHookBase, TPluginOptions>;
