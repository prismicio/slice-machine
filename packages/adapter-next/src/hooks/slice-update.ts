import type { SliceUpdateHook } from "@slicemachine/plugin-kit";
import {
	upsertGlobalTypeScriptTypes,
	writeSliceModel,
} from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const sliceUpdate: SliceUpdateHook<PluginOptions> = async (
	data,
	context,
) => {
	await writeSliceModel({
		libraryID: data.libraryID,
		model: data.model,
		format: context.options.format,
		helpers: context.helpers,
	});

	await upsertGlobalTypeScriptTypes({
		filename: context.options.generatedTypesFilePath,
		format: context.options.format,
		helpers: context.helpers,
		actions: context.actions,
	});
};
