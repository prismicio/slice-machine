import { SliceMachineHelpers } from "../createSliceMachineHelpers";

import { CUSTOM_TYPES_LIBRARY_DIRNAME } from "./constants";

export type BuildCustomTypeLibraryDirectoryPathArgs = {
	absolute?: boolean;
	helpers: SliceMachineHelpers;
};

export const buildCustomTypeLibraryDirectoryPath = (
	args: BuildCustomTypeLibraryDirectoryPathArgs,
): string => {
	return args.absolute
		? args.helpers.joinPathFromRoot(CUSTOM_TYPES_LIBRARY_DIRNAME)
		: CUSTOM_TYPES_LIBRARY_DIRNAME;
};
