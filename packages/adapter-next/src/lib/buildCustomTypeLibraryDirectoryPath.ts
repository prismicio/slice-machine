import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";

type BuildCustomTypeLibraryDirectoryPathArgs = {
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

export const buildCustomTypeLibraryDirectoryPath = (
	args: BuildCustomTypeLibraryDirectoryPathArgs,
): string => {
	return args.helpers.joinPathFromRoot("customtypes");
};
