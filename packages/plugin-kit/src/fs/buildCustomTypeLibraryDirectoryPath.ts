import { PluginSystemHelpers } from "../createPluginSystemHelpers";

import { CUSTOM_TYPES_LIBRARY_DIRNAME } from "./constants";

export type BuildCustomTypeLibraryDirectoryPathArgs = {
	absolute?: boolean;
	helpers: PluginSystemHelpers;
};

export const buildCustomTypeLibraryDirectoryPath = (
	args: BuildCustomTypeLibraryDirectoryPathArgs,
): string => {
	return args.absolute
		? args.helpers.joinPathFromRoot(CUSTOM_TYPES_LIBRARY_DIRNAME)
		: CUSTOM_TYPES_LIBRARY_DIRNAME;
};
