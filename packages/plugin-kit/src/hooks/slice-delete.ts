import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `slice:delete` hook handlers.
 */
export type SliceDeleteHookData = {
	libraryID: string;
	model: TypesInternal.SharedSlice;
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
export type SliceDeleteHookBase = PluginHook<
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
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<SliceDeleteHookBase, TPluginOptions>;
