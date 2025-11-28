import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `custom-type:update` hook handlers.
 */
export type CustomTypeUpdateHookData = {
	model: TypesInternal.CustomType;
};

/**
 * Return value for `custom-type:update` hook handlers.
 */
export type CustomTypeUpdateHookReturnType = void;

/**
 * Base version of a `custom-type:update` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type CustomTypeUpdateHookBase = PluginHook<
	CustomTypeUpdateHookData,
	CustomTypeUpdateHookReturnType
>;

/**
 * Handler for the `custom-type:update` hook. The hook is called when a Custom
 * Type is updated.
 *
 * `custom-type:update` is not called the first time a Custom Type is saved. The
 * `custom-type:create` hook is called instead.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeUpdateHook<
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<CustomTypeUpdateHookBase, TPluginOptions>;
