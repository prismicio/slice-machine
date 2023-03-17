import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";

type BuildSliceLibraryDirectoryPathArgs = {
	libraryID: string;
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

export const buildSliceLibraryDirectoryPath = (
	args: BuildSliceLibraryDirectoryPathArgs,
): string => {
	return args.helpers.joinPathFromRoot(args.libraryID);
};
