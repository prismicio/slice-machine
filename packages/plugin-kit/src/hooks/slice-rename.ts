import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `slice:rename` hook handlers.
 */
export type SliceRenameHookData = {
	libraryID: string;
	model: SharedSlice;
};

/**
 * Return value for `slice:rename` hook handlers.
 */
export type SliceRenameHookReturnType = void;

/**
 * Base version of a `slice:rename` hook handler without plugin runner context.
 *
 * @internal
 */
export type SliceRenameHookBase = PluginHook<
	SliceRenameHookData,
	SliceRenameHookReturnType
>;

/**
 * Handler for the `slice:rename` hook. The hook is called when a Slice is
 * renamed.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceRenameHook<
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<SliceRenameHookBase, TPluginOptions>;
