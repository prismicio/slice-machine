import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `slice:update` hook handlers.
 */
export type SliceUpdateHookData = {
	libraryID: string;
	model: TypesInternal.SharedSlice;
};

/**
 * Return value for `slice:update` hook handlers.
 */
export type SliceUpdateHookReturnType = void;

/**
 * Base version of a `slice:update` hook handler without plugin runner context.
 *
 * @internal
 */
export type SliceUpdateHookBase = PluginHook<
	SliceUpdateHookData,
	SliceUpdateHookReturnType
>;

/**
 * Handler for the `slice:update` hook. The hook is called when a Slice is
 * updated.
 *
 * `slice:update` is not called the first time a Slice is saved. The
 * `slice:create` hook is called instead.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceUpdateHook<
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<SliceUpdateHookBase, TPluginOptions>;
