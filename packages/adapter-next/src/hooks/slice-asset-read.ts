import type { SliceAssetReadHook } from "@slicemachine/plugin-kit";
import { readSliceFile } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const sliceAssetRead: SliceAssetReadHook<PluginOptions> = async (
	data,
	context,
) => {
	const file = await readSliceFile({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		filename: data.assetID,
		actions: context.actions,
		helpers: context.helpers,
	});

	return {
		data: file,
	};
};
