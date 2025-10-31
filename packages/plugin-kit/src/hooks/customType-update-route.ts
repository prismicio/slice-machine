import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:update-route` hook handlers.
 */
export type CustomTypeUpdateRouteHookData = {
	model: CustomType;
};

/**
 * Return value for `custom-type:update-route` hook handlers.
 */
export type CustomTypeUpdateRouteHookReturnType = void;

/**
 * Base version of a `custom-type:update-route` hook handler without plugin
 * runner context.
 *
 * @internal
 */
export type CustomTypeUpdateRouteHookBase = SliceMachineHook<
	CustomTypeUpdateRouteHookData,
	CustomTypeUpdateRouteHookReturnType
>;

/**
 * Handler for the `custom-type:update-route` hook. The hook is called when a
 * Custom Type route is updated.
 *
 * `custom-type:update-route` is not called the first time a Custom Type is
 * updated.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type CustomTypeUpdateRouteHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeUpdateRouteHookBase, TPluginOptions>;
