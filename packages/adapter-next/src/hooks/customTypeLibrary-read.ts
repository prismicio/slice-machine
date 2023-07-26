import type { CustomTypeLibraryReadHook } from "@slicemachine/plugin-kit";
import { readCustomTypeLibrary } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeLibraryRead: CustomTypeLibraryReadHook<
	PluginOptions
> = async (_data, context) => {
	return readCustomTypeLibrary({ helpers: context.helpers });
};
