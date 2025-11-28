import { PluginSystemContext } from "./createPluginSystemContext";
import { Plugin } from "./definePlugin";
import { Hook } from "./lib/HookSystem";

import { ProjectInitHookBase } from "./hooks/project-init";
import { CustomTypeCreateHookBase } from "./hooks/customType-create";
import { CustomTypeDeleteHookBase } from "./hooks/customType-delete";
import { CustomTypeLibraryReadHookBase } from "./hooks/customTypeLibrary-read";
import { CustomTypeReadHookBase } from "./hooks/customType-read";
import { CustomTypeRenameHookBase } from "./hooks/customType-rename";
import { CustomTypeUpdateHookBase } from "./hooks/customType-update";
import { DebugHookBase } from "./hooks/debug";
import { SliceCreateHookBase } from "./hooks/slice-create";
import { SliceDeleteHookBase } from "./hooks/slice-delete";
import { SliceLibraryReadHookBase } from "./hooks/sliceLibrary-read";
import { SliceReadHookBase } from "./hooks/slice-read";
import { SliceRenameHookBase } from "./hooks/slice-rename";
import { SliceUpdateHookBase } from "./hooks/slice-update";

/**
 * A value optionally wrapped in a `PromiseLike`.
 *
 * @typeParam T - The value that can optionally be wrapped.
 */
export type Promisable<T> = T | PromiseLike<T>;

/**
 * A generic type for a user-provided plugin options. Prefer using a
 * plugin-specific type over this type.
 */
export type PluginOptions = Record<string, unknown>;

/**
 * A string, object, or instance representing a registered plugin.
 *
 * @typeParam TPluginOptions - User-provided options for the plugin.
 */
export type PrismicConfigPluginRegistration<
	TPluginOptions extends PluginOptions = PluginOptions,
> =
	| string
	| Plugin
	| {
			resolve: string | Plugin;
			options?: TPluginOptions;
	  };

/**
 * Prismic configuration from `prismic.config.js`.
 */
export type PrismicConfig = {
	repositoryName: string;
	adapter: PrismicConfigPluginRegistration;
	libraries?: string[];
	apiEndpoint?: string;
};

/**
 * Prismic project metadata.
 */
export type PrismicProject = {
	/**
	 * An absolute path to project root.
	 */
	root: string;
	/**
	 * Prismic `prismic.config.json` content, validated.
	 */
	config: PrismicConfig;
};

/**
 * A Slice Library's metadata.
 */
export type SliceLibrary = {
	id: string;
};

// ============================================================================
//
// # HOOK TYPES
//
// ============================================================================

/**
 * A hook handler.
 */
export type PluginHook<TData, TReturn> = (data: TData) => Promisable<TReturn>;

/**
 * Extra arguments provided to hooks when called.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type PluginHookExtraArgs<
	TPluginOptions extends PluginOptions = PluginOptions,
> = [context: PluginSystemContext<TPluginOptions>];

/**
 * Utility type to extend a hook handler's type with Plugin System-specific
 * extra arguments.
 *
 * @typeParam THook - Hook handler to extend.
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type ExtendPluginSystemHook<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	THook extends PluginHook<any, any>,
	TPluginOptions extends PluginOptions = PluginOptions,
> = (
	...args: [
		...args: Parameters<THook>,
		...extraArgs: PluginHookExtraArgs<TPluginOptions>,
	]
) => ReturnType<THook>;

/**
 * Hook types.
 */
export const PluginHookType = {
	slice_create: "slice:create",
	slice_update: "slice:update",
	slice_rename: "slice:rename",
	slice_delete: "slice:delete",
	slice_read: "slice:read",
	sliceLibrary_read: "slice-library:read",

	customType_create: "custom-type:create",
	customType_update: "custom-type:update",
	customType_rename: "custom-type:rename",
	customType_delete: "custom-type:delete",
	customType_read: "custom-type:read",
	customTypeLibrary_read: "custom-type-library:read",

	snippet_read: "snippet:read",

	project_init: "project:init",

	debug: "debug",
} as const;

/**
 * Hook types.
 */
export type PluginHookTypes =
	(typeof PluginHookType)[keyof typeof PluginHookType];

/**
 * Plugin hook handlers.
 */
export type PluginHooks = {
	// Slices
	[PluginHookType.slice_create]: Hook<SliceCreateHookBase>;
	[PluginHookType.slice_update]: Hook<SliceUpdateHookBase>;
	[PluginHookType.slice_rename]: Hook<SliceRenameHookBase>;
	[PluginHookType.slice_delete]: Hook<SliceDeleteHookBase>;
	[PluginHookType.slice_read]: Hook<SliceReadHookBase>;

	// Slice Libraries
	[PluginHookType.sliceLibrary_read]: Hook<SliceLibraryReadHookBase>;

	// Custom Types
	[PluginHookType.customType_create]: Hook<CustomTypeCreateHookBase>;
	[PluginHookType.customType_update]: Hook<CustomTypeUpdateHookBase>;
	[PluginHookType.customType_rename]: Hook<CustomTypeRenameHookBase>;
	[PluginHookType.customType_delete]: Hook<CustomTypeDeleteHookBase>;
	[PluginHookType.customType_read]: Hook<CustomTypeReadHookBase>;
	// Custom Type Libraries
	[PluginHookType.customTypeLibrary_read]: Hook<CustomTypeLibraryReadHookBase>;

	// Project
	[PluginHookType.project_init]: Hook<ProjectInitHookBase>;

	// Debug
	[PluginHookType.debug]: Hook<DebugHookBase>;
};
