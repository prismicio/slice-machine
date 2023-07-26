import type { SliceAssetUpdateHook } from "@slicemachine/plugin-kit";
import { writeSliceFile } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const sliceAssetUpdate: SliceAssetUpdateHook<PluginOptions> = async (
	data,
	context,
) => {
	await writeSliceFile({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		filename: data.asset.id,
		contents: data.asset.data,
		actions: context.actions,
		helpers: context.helpers,
	});
};
