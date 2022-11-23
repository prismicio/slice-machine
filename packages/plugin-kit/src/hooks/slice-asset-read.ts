import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:asset:read` hook handlers.
 */
export type SliceAssetReadHookData = {
	libraryID: string;
	sliceID: string;
	assetID: string;
};

/**
 * Return value for `slice:asset:read` hook handlers.
 */
export type SliceAssetReadHookReturnType = {
	data: Buffer;
};

/**
 * Base version of `slice:asset:read` without plugin runner context.
 *
 * @internal
 */
export type SliceAssetReadHookBase = SliceMachineHook<
	SliceAssetReadHookData,
	SliceAssetReadHookReturnType
>;

/**
 * Handler for the `slice:asset:read` hook. The hook is called when a Slice's
 * asset needs to be read.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * This hook will only be called in adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceAssetReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceAssetReadHookBase, TPluginOptions>;
