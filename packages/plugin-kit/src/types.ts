import { SliceMachineContext } from "./createSliceMachineContext";
import { SliceMachinePlugin } from "./defineSliceMachinePlugin";
import { Hook } from "./lib/HookSystem";

import { ProjectInitHookBase } from "./hooks/project-init";
import { CustomTypeAssetDeleteHookBase } from "./hooks/customType-asset-delete";
import { CustomTypeAssetReadHookBase } from "./hooks/customType-asset-read";
import { CustomTypeAssetUpdateHookBase } from "./hooks/customType-asset-update";
import { CustomTypeCreateHookBase } from "./hooks/customType-create";
import { CustomTypeDeleteHookBase } from "./hooks/customType-delete";
import { CustomTypeLibraryReadHookBase } from "./hooks/customTypeLibrary-read";
import { CustomTypeReadHookBase } from "./hooks/customType-read";
import { CustomTypeRenameHookBase } from "./hooks/customType-rename";
import { CustomTypeUpdateHookBase } from "./hooks/customType-update";
import { DebugHookBase } from "./hooks/debug";
import { SliceAssetDeleteHookBase } from "./hooks/slice-asset-delete";
import { SliceAssetReadHookBase } from "./hooks/slice-asset-read";
import { SliceAssetUpdateHookBase } from "./hooks/slice-asset-update";
import { SliceCreateHookBase } from "./hooks/slice-create";
import { SliceDeleteHookBase } from "./hooks/slice-delete";
import { SliceLibraryReadHookBase } from "./hooks/sliceLibrary-read";
import { SliceReadHookBase } from "./hooks/slice-read";
import { SliceRenameHookBase } from "./hooks/slice-rename";
import { SliceSimulatorSetupReadHookBase } from "./hooks/sliceSimulator-setup-read";
import { SliceUpdateHookBase } from "./hooks/slice-update";
import { SnippetReadHookBase } from "./hooks/snippet-read";
import { DocumentationReadHookBase } from "./hooks/documentation-read";

import { SliceTemplateLibraryReadHookBase } from "./hooks/sliceTemplateLibrary-read";

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
export type SliceMachinePluginOptions = Record<string, unknown>;

/**
 * A string, object, or instance representing a registered plugin.
 *
 * @typeParam TPluginOptions - User-provided options for the plugin.
 */
export type SliceMachineConfigPluginRegistration<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> =
	| string
	| SliceMachinePlugin
	| {
			resolve: string | SliceMachinePlugin;
			options?: TPluginOptions;
	  };

/**
 * Slice Machine configuration from `slicemachine.config.js`.
 */
export type SliceMachineConfig = {
	// TODO: Can we make `apiEndpoint` optional?
	apiEndpoint?: string;
	// NOTE: This is a new property.
	repositoryName: string;
	localSliceSimulatorURL?: string;
	libraries?: string[];
	adapter: SliceMachineConfigPluginRegistration;
	plugins?: SliceMachineConfigPluginRegistration[];
};

/**
 * Slice Machine project metadata.
 */
export type SliceMachineProject = {
	/**
	 * An absolute path to project root.
	 */
	root: string;
	/**
	 * Slice Machine `sm.json` content, validated.
	 */
	config: SliceMachineConfig;
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
export type SliceMachineHook<TData, TReturn> = (
	data: TData,
) => Promisable<TReturn>;

/**
 * Extra arguments provided to hooks when called.
 *
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type SliceMachineHookExtraArgs<
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = [context: SliceMachineContext<TPluginOptions>];

/**
 * Utility type to extend a hook handler's type with Slice Machine-specific
 * extra arguments.
 *
 * @typeParam THook - Hook handler to extend.
 * @typeParam TPluginOptions - User-provided options for the hook's plugin.
 */
export type ExtendSliceMachineHook<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	THook extends SliceMachineHook<any, any>,
	TPluginOptions extends SliceMachinePluginOptions = SliceMachinePluginOptions,
> = (
	...args: [
		...args: Parameters<THook>,
		...extraArgs: SliceMachineHookExtraArgs<TPluginOptions>,
	]
) => ReturnType<THook>;

/**
 * Hook types.
 */
export const SliceMachineHookType = {
	slice_create: "slice:create",
	slice_update: "slice:update",
	slice_rename: "slice:rename",
	slice_delete: "slice:delete",
	slice_read: "slice:read",
	slice_asset_update: "slice:asset:update",
	slice_asset_delete: "slice:asset:delete",
	slice_asset_read: "slice:asset:read",
	sliceLibrary_read: "slice-library:read",

	customType_create: "custom-type:create",
	customType_update: "custom-type:update",
	customType_rename: "custom-type:rename",
	customType_delete: "custom-type:delete",
	customType_read: "custom-type:read",
	customType_asset_update: "custom-type:asset:update",
	customType_asset_delete: "custom-type:asset:delete",
	customType_asset_read: "custom-type:asset:read",
	customTypeLibrary_read: "custom-type-library:read",
	documentation_read: "documentation:read",
	sliceTemplateLibrary_read: "slice-template-library:read",

	snippet_read: "snippet:read",

	sliceSimulator_setup_read: "slice-simulator:setup:read",

	project_init: "project:init",

	debug: "debug",
} as const;

/**
 * Hook types.
 */
export type SliceMachineHookTypes =
	(typeof SliceMachineHookType)[keyof typeof SliceMachineHookType];

/**
 * Slice Machine-specific hook handlers.
 */
export type SliceMachineHooks = {
	// Slices
	[SliceMachineHookType.slice_create]: Hook<SliceCreateHookBase>;
	[SliceMachineHookType.slice_update]: Hook<SliceUpdateHookBase>;
	[SliceMachineHookType.slice_rename]: Hook<SliceRenameHookBase>;
	[SliceMachineHookType.slice_delete]: Hook<SliceDeleteHookBase>;
	[SliceMachineHookType.slice_read]: Hook<SliceReadHookBase>;
	[SliceMachineHookType.slice_asset_update]: Hook<SliceAssetUpdateHookBase>;
	[SliceMachineHookType.slice_asset_delete]: Hook<SliceAssetDeleteHookBase>;
	[SliceMachineHookType.slice_asset_read]: Hook<SliceAssetReadHookBase>;

	// Slice Libraries
	[SliceMachineHookType.sliceLibrary_read]: Hook<SliceLibraryReadHookBase>;

	// Custom Types
	[SliceMachineHookType.customType_create]: Hook<CustomTypeCreateHookBase>;
	[SliceMachineHookType.customType_update]: Hook<CustomTypeUpdateHookBase>;
	[SliceMachineHookType.customType_rename]: Hook<CustomTypeRenameHookBase>;
	[SliceMachineHookType.customType_delete]: Hook<CustomTypeDeleteHookBase>;
	[SliceMachineHookType.customType_read]: Hook<CustomTypeReadHookBase>;
	[SliceMachineHookType.customType_asset_update]: Hook<CustomTypeAssetUpdateHookBase>;
	[SliceMachineHookType.customType_asset_delete]: Hook<CustomTypeAssetDeleteHookBase>;
	[SliceMachineHookType.customType_asset_read]: Hook<CustomTypeAssetReadHookBase>;

	// Custom Type Libraries
	[SliceMachineHookType.customTypeLibrary_read]: Hook<CustomTypeLibraryReadHookBase>;

	// Snippets
	[SliceMachineHookType.snippet_read]: Hook<SnippetReadHookBase>;

	// Documentation
	[SliceMachineHookType.documentation_read]: Hook<DocumentationReadHookBase>;

	// Slice Simulator
	[SliceMachineHookType.sliceSimulator_setup_read]: Hook<SliceSimulatorSetupReadHookBase>;

	// Project
	[SliceMachineHookType.project_init]: Hook<ProjectInitHookBase>;

	// Debug
	[SliceMachineHookType.debug]: Hook<DebugHookBase>;

	// Slice templates
	[SliceMachineHookType.sliceTemplateLibrary_read]: Hook<SliceTemplateLibraryReadHookBase>;
};
