import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:asset:update` hook handlers.
 */
export type CustomTypeAssetUpdateHookData = {
	customTypeID: string;
	asset: {
		id: string;
		data: Buffer;
	};
};

/**
 * Return value for `custom-type:asset:update` hook handlers.
 */
export type CustomTypeAssetUpdateHookReturnType = void;

/**
 * Base version of `custom-type:asset:update` without plugin runner context.
 *
 * @internal
 */
export type CustomTypeAssetUpdateHookBase = SliceMachineHook<
	CustomTypeAssetUpdateHookData,
	CustomTypeAssetUpdateHookReturnType
>;

/**
 * Handler for the `custom-type:asset:update` hook. The hook is called when a
 * Custom Type's asset needs to be created or updated.
 *
 * `custom-type:asset:update` is called when an asset needs to be saved for the
 * first time or updated if it already exists.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeAssetUpdateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeAssetUpdateHookBase, TPluginOptions>;
