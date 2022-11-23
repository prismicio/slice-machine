import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:asset:update` hook handlers.
 */
export type SliceAssetUpdateHookData = {
	libraryID: string;
	sliceID: string;
	asset: {
		id: string;
		data: Buffer;
	};
};

/**
 * Return value for `slice:asset:update` hook handlers.
 */
export type SliceAssetUpdateHookReturnType = void;

/**
 * Base version of `slice:asset:update` without plugin runner context.
 *
 * @internal
 */
export type SliceAssetUpdateHookBase = SliceMachineHook<
	SliceAssetUpdateHookData,
	SliceAssetUpdateHookReturnType
>;

/**
 * Handler for the `slice:asset:update` hook. The hook is called when a Slice's
 * asset needs to be created or updated.
 *
 * `slice:asset:update` is called when an asset needs to be saved for the first
 * time or updated if it already exists.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceAssetUpdateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceAssetUpdateHookBase, TPluginOptions>;
