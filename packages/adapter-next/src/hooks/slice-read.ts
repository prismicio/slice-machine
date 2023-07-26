import { readSliceModel } from "@slicemachine/adapter-universal";
import type { SliceReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

export const sliceRead: SliceReadHook<PluginOptions> = async (
	data,
	context,
) => {
	return readSliceModel({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		helpers: context.helpers,
	});
};
