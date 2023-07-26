import type { SliceAssetDeleteHook } from "@slicemachine/plugin-kit";
import { deleteSliceFile } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const sliceAssetDelete: SliceAssetDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	await deleteSliceFile({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		filename: data.assetID,
		helpers: context.helpers,
		actions: context.actions,
	});
};
