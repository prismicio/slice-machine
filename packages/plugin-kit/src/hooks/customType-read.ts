import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

import type {
	ExtendPluginSystemHook,
	PluginOptions,
	PluginHook,
} from "../types";

/**
 * Data provided to `custom-type:read` hook handlers.
 */
export type CustomTypeReadHookData = {
	id: string;
};

/**
 * Return value for `custom-type:read` hook handlers.
 */
export type CustomTypeReadHookReturnType = {
	model: TypesInternal.CustomType;
};

/**
 * Base version of a `custom-type:read` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type CustomTypeReadHookBase = PluginHook<
	CustomTypeReadHookData,
	CustomTypeReadHookReturnType
>;

/**
 * Handler for the `custom-type:read` hook. The hook is called when a Custom
 * Type's model is needed.
 *
 * This hook is **required** to be implemented by adapters.
 *
 * This hook will only be called in adapters.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeReadHook<
	TPluginOptions extends PluginOptions = PluginOptions,
> = ExtendPluginSystemHook<CustomTypeReadHookBase, TPluginOptions>;
