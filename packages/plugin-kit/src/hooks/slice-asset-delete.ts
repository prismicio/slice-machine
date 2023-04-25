import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:asset:delete` hook handlers.
 */
export type SliceAssetDeleteHookData = {
	libraryID: string;
	sliceID: string;
	assetID: string;
};

/**
 * Return value for `slice:asset:delete` hook handlers.
 */
export type SliceAssetDeleteHookReturnType = void;

/**
 * Base version of `slice:asset:delete` without plugin runner context.
 *
 * @internal
 */
export type SliceAssetDeleteHookBase = SliceMachineHook<
	SliceAssetDeleteHookData,
	SliceAssetDeleteHookReturnType
>;

/**
 * Handler for the `slice:asset:delete` hook. The hook is called when a Slice
 * asset is deleted.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceAssetDeleteHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceAssetDeleteHookBase, TPluginOptions>;
