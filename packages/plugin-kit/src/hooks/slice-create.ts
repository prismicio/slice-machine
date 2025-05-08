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

/**
 * Render a code placeholder for a Slice.
 *
 * @param slice - The Slice to render the code placeholder for.
 *
 * @returns The code placeholder for the Slice.
 */
export function renderSliceCodePlaceholder(slice: SharedSlice) {
	return `
		Placeholder component for ${slice.id} (variation: {slice.variation}) slices.
		<br />
		<strong>You can edit this slice directly in your code editor.</strong>
		{/**
		 * 💡 Use Prismic MCP with your code editor
		 *
		 * Get AI-powered help to build your slice components — based on your actual model.
		 *
		 * ▶️ Setup:
		 * 1. Add a new MCP Server in your code editor:
		 *
		 * {
		 *   "mcpServers": {
		 *     "Prismic MCP": {
		 *       "command": "npx",
		 *       "args": ["-y", "@prismicio/mcp-server"]
		 *     }
		 *   }
		 * }
		 *
		 * 2. Select Claude 3.7 Sonnet for better output (more for a recommendation)
		 *
		 * ✅ Then open your slice file and ask Cursor:
		 *    "Code this slice"
		 *
		 * Cursor reads your slice model and helps you code faster ⚡
		 * 📚 Give your feedback: https://comprismic.io/docs/technologies/mcp-with-cursor
		 */}
	`;
}
