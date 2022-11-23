import type { SharedSliceModel } from "@prismicio/types";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:delete` hook handlers.
 */
export type SliceDeleteHookData = {
	libraryID: string;
	model: SharedSliceModel;
};

/**
 * Return value for `slice:delete` hook handlers.
 */
export type SliceDeleteHookReturnType = void;

/**
 * Base version of a `slice:delete` hook handler without plugin runner context.
 *
 * @internal
 */
export type SliceDeleteHookBase = SliceMachineHook<
	SliceDeleteHookData,
	SliceDeleteHookReturnType
>;

/**
 * Handler for the `slice:delete` hook. The hook is called when a Slice is
 * deleted.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceDeleteHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceDeleteHookBase, TPluginOptions>;
