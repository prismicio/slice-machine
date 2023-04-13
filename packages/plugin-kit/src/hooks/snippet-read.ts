import type { DynamicWidget } from "@prismicio/types-internal/lib/customtypes";

import type {
	ExtendSliceMachineHook,
	SliceMachinePluginOptions,
	SliceMachineHook,
} from "../types";

/**
 * An object representing a code snippet.
 */
export type Snippet = {
	label: string;
	language: string;
	code: string;
};

/**
 * Data provided to `snippet:read` hook handlers.
 */
export type SnippetReadHookData = {
	fieldPath: string[];
	model: DynamicWidget;
};

/**
 * Return value for `snippet:read` hook handlers.
 */
export type SnippetReadHookReturnType = Snippet | Snippet[] | undefined;

/**
 * Base version of a `snippet:read` hook handler without plugin runner context.
 *
 * @internal
 */
export type SnippetReadHookBase = SliceMachineHook<
	SnippetReadHookData,
	SnippetReadHookReturnType
>;

/**
 * Handler for the `snippet:read` hook. The hook is called when a Slice Machine
 * needs a code snippet to display with a Custom Type or Slice field.
 *
 * The returned snippet should be specific to the field. It should be code a
 * user can use in their application.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SnippetReadHook<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = ExtendSliceMachineHook<SnippetReadHookBase, TPluginOptions>;
