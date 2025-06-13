import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * Data provided to `custom-type:update` hook handlers.
 */
export type CustomTypeUpdateHookData = {
	model: CustomType;
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
export type CustomTypeUpdateHookBase = SliceMachineHook<
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
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<CustomTypeUpdateHookBase, TPluginOptions>;
