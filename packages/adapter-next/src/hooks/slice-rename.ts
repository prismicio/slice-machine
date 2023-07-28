import type { SliceRenameHook } from "@slicemachine/plugin-kit";
import {
	renameSlice,
	upsertGlobalTypeScriptTypes,
} from "@slicemachine/adapter-universal";

import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

export const sliceRename: SliceRenameHook<PluginOptions> = async (
	data,
	context,
) => {
	await renameSlice({
		libraryID: data.libraryID,
		model: data.model,
		format: context.options.format,
		actions: context.actions,
		helpers: context.helpers,
	});

	rejectIfNecessary(
		await Promise.allSettled([
			upsertSliceLibraryIndexFile({
				libraryID: data.libraryID,
				...context,
			}),
			upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				helpers: context.helpers,
				actions: context.actions,
			}),
		]),
	);
};
