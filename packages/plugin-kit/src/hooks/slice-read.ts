import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:read` hook handlers.
 */
export type SliceReadHookData = {
	libraryID: string;
	sliceID: string;
};

/**
 * Return value for `slice:read` hook handlers.
 */
export type SliceReadHookReturnType = { model: SharedSlice };

/**
 * Base version of a `slice:read` hook handler without plugin runner context.
 *
 * @internal
 */
export type SliceReadHookBase = SliceMachineHook<
	SliceReadHookData,
	SliceReadHookReturnType
>;

/**
 * Handler for the `slice:read` hook. The hook is called when a Slice's model is
 * needed.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * This hook will only be called in adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceReadHookBase, TPluginOptions>;
