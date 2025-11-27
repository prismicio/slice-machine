///////////////////////////////////////////////////////////////////////////////
//
// Public (for plugin authors)
//
///////////////////////////////////////////////////////////////////////////////

export { definePlugin } from "./definePlugin";
export type { Plugin } from "./definePlugin";

export type {
	PluginSystemActions,
	ReadAllSliceModelsActionArgs,
	ReadAllSliceModelsActionReturnType,
	ReadAllSliceModelsForLibraryActionArgs,
} from "./createPluginSystemActions";
export type { PluginSystemHelpers } from "./createPluginSystemHelpers";
export type { PluginSystemContext } from "./createPluginSystemContext";

export { PluginHookType } from "./types";
export type {
	PluginOptions,
	PrismicProject,
	PrismicConfig,
	SliceLibrary,
	PluginHooks,
	PluginHookTypes,
} from "./types";

export { HookError } from "./lib/HookSystem";
export { DecodeError } from "./lib/DecodeError";

///////////////////////////////////////////////////////////////////////////////
//
// Hooks (for plugin authors)
//
///////////////////////////////////////////////////////////////////////////////

// slice:asset:update
export type {
	SliceAssetUpdateHook,
	SliceAssetUpdateHookData,
	SliceAssetUpdateHookReturnType,
} from "./hooks/slice-asset-update";

// slice:asset:delete
export type {
	SliceAssetDeleteHook,
	SliceAssetDeleteHookData,
	SliceAssetDeleteHookReturnType,
} from "./hooks/slice-asset-delete";

// slice:asset:read
export type {
	SliceAssetReadHook,
	SliceAssetReadHookData,
	SliceAssetReadHookReturnType,
} from "./hooks/slice-asset-read";

// slice:create
export type {
	SliceCreateHook,
	SliceCreateHookData,
	SliceCreateHookReturnType,
} from "./hooks/slice-create";

// slice:update
export type {
	SliceUpdateHook,
	SliceUpdateHookData,
	SliceUpdateHookReturnType,
} from "./hooks/slice-update";

// slice:rename
export type {
	SliceRenameHook,
	SliceRenameHookData,
	SliceRenameHookReturnType,
} from "./hooks/slice-rename";

// slice:delete
export type {
	SliceDeleteHook,
	SliceDeleteHookData,
	SliceDeleteHookReturnType,
} from "./hooks/slice-delete";

// slice:read
export type {
	SliceReadHook,
	SliceReadHookData,
	SliceReadHookReturnType,
} from "./hooks/slice-read";

// slice-library:read
export type {
	SliceLibraryReadHook,
	SliceLibraryReadHookData,
	SliceLibraryReadHookReturnType,
} from "./hooks/sliceLibrary-read";

// custom-type:asset:update
export type {
	CustomTypeAssetUpdateHook,
	CustomTypeAssetUpdateHookData,
	CustomTypeAssetUpdateHookReturnType,
} from "./hooks/customType-asset-update";

// custom-type:asset:delete
export type {
	CustomTypeAssetDeleteHook,
	CustomTypeAssetDeleteHookData,
	CustomTypeAssetDeleteHookReturnType,
} from "./hooks/customType-asset-delete";

// custom-type:asset:read
export type {
	CustomTypeAssetReadHook,
	CustomTypeAssetReadHookData,
	CustomTypeAssetReadHookReturnType,
} from "./hooks/customType-asset-read";

// custom-type:create
export type {
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	CustomTypeCreateHookReturnType,
} from "./hooks/customType-create";

// custom-type:update
export type {
	CustomTypeUpdateHook,
	CustomTypeUpdateHookData,
	CustomTypeUpdateHookReturnType,
} from "./hooks/customType-update";

// custom-type:rename
export type {
	CustomTypeRenameHook,
	CustomTypeRenameHookData,
	CustomTypeRenameHookReturnType,
} from "./hooks/customType-rename";

// custom-type:delete
export type {
	CustomTypeDeleteHook,
	CustomTypeDeleteHookData,
	CustomTypeDeleteHookReturnType,
} from "./hooks/customType-delete";

// custom-type:read
export type {
	CustomTypeReadHook,
	CustomTypeReadHookData,
	CustomTypeReadHookReturnType,
} from "./hooks/customType-read";

// custom-type-library:read
export type {
	CustomTypeLibraryReadHook,
	CustomTypeLibraryReadHookData,
	CustomTypeLibraryReadHookReturnType,
} from "./hooks/customTypeLibrary-read";

// project:init
export type {
	ProjectInitHook,
	ProjectInitHookData,
	ProjectInitHookReturnType,
} from "./hooks/project-init";
///////////////////////////////////////////////////////////////////////////////
//
// Internal (for Plugin System)
//
///////////////////////////////////////////////////////////////////////////////

export {
	createPluginSystemRunner,
	PluginSystemRunner,
	REQUIRED_ADAPTER_HOOKS,
	ADAPTER_ONLY_HOOKS,
} from "./createPluginSystemRunner";

export type { CallHookReturnType } from "./lib/HookSystem";
