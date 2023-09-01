import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `slice:create` hook handlers.
 */
export type SliceCreateHookData = {
	libraryID: string;
	model: SharedSlice;
	componentContents?: string;
};

/**
 * Return value for `slice:create` hook handlers.
 */
export type SliceCreateHookReturnType = void;

/**
 * Base version of `slice:create` without plugin runner context.
 *
 * @internal
 */
export type SliceCreateHookBase = SliceMachineHook<
	SliceCreateHookData,
	SliceCreateHookReturnType
>;

/**
 * Handler for the `slice:create` hook. The hook is called when a Slice is
 * created.
 *
 * `slice:create` is only called the first time a Slice is saved. Subsequent
 * saves will call the `slice:update` hook.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceCreateHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SliceCreateHookBase, TPluginOptions>;
