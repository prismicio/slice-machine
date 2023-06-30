import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * An object representing a documentation text.
 */
export type Documentation = {
	label?: string;
	content: string;
};

/**
 * Data provided to `documentation:read` hook handlers.
 */
export type DocumentationReadHookData = {
	kind: "PageSnippet";
	data: {
		model: CustomType;
	};
};

/**
 * Return value for `documentation:read` hook handlers.
 */
export type DocumentationReadHookReturnType = Documentation[];

/**
 * Base version of a `documentation:read` hook handler without plugin runner
 * context.
 *
 * @internal
 */
export type DocumentationReadHookBase = SliceMachineHook<
	DocumentationReadHookData,
	DocumentationReadHookReturnType
>;

/**
 * Handler for the `documentation:read` hook. The hook is called when Slice
 * Machine needs documentation to display with contextual information.
 *
 * The returned documentation should be specific and using Markdown syntax.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type DocumentationReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<DocumentationReadHookBase, TPluginOptions>;
