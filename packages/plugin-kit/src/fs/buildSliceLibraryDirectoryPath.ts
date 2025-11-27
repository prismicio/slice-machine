import * as path from "node:path";

import { PluginSystemHelpers } from "../createPluginSystemHelpers";

export type BuildSliceLibraryDirectoryPathArgs = {
	libraryID: string;
	absolute?: boolean;
	helpers: PluginSystemHelpers;
};

export const buildSliceLibraryDirectoryPath = (
	args: BuildSliceLibraryDirectoryPathArgs,
): string => {
	return args.absolute
		? args.helpers.joinPathFromRoot(args.libraryID)
		: path.join(args.libraryID);
};
