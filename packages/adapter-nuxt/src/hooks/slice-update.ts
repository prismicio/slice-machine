import type { SliceUpdateHook } from "@slicemachine/plugin-kit";

import { updateSliceModelFile } from "../lib/updateSliceModelFile";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";

import type { PluginOptions } from "../types";

export const sliceUpdate: SliceUpdateHook<PluginOptions> = async (
	data,
	context,
) => {
	await updateSliceModelFile({
		libraryID: data.libraryID,
		model: data.model,
		...context,
	});

	await upsertGlobalContentTypes(context);
};
