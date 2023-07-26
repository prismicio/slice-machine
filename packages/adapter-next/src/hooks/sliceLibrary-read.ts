import { readSliceLibrary } from "@slicemachine/adapter-universal";
import type { SliceLibraryReadHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

export const sliceLibraryRead: SliceLibraryReadHook<PluginOptions> = async (
	data,
	context,
) => {
	return readSliceLibrary({
		libraryID: data.libraryID,
		helpers: context.helpers,
	});
};
