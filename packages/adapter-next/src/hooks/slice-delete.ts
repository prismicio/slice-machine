import {
	deleteAllSliceFiles,
	upsertGlobalTypeScriptTypes,
} from "@slicemachine/adapter-universal";
import type { SliceDeleteHook } from "@slicemachine/plugin-kit";

import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

export const sliceDelete: SliceDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	await deleteAllSliceFiles({
		libraryID: data.libraryID,
		model: data.model,
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
