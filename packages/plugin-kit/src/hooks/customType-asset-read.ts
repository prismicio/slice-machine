import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:asset:read` hook handlers.
 */
export type CustomTypeAssetReadHookData = {
	customTypeID: string;
	assetID: string;
};

/**
 * Return value for `custom-type:asset:read` hook handlers.
 */
export type CustomTypeAssetReadHookReturnType = {
	data: Buffer;
};

/**
 * Base version of `custom-type:asset:read` without plugin runner context.
 *
 * @internal
 */
export type CustomTypeAssetReadHookBase = SliceMachineHook<
	CustomTypeAssetReadHookData,
	CustomTypeAssetReadHookReturnType
>;

/**
 * Handler for the `slice:asset:read` hook. The hook is called when a Custom
 * Type's asset needs to be read.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * This hook will only be called in adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeAssetReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeAssetReadHookBase, TPluginOptions>;
