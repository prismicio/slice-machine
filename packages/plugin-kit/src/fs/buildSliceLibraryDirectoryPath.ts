import * as path from "node:path";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

export type BuildSliceLibraryDirectoryPathArgs = {
	libraryID: string;
	absolute?: boolean;
	helpers: SliceMachineHelpers;
};

export const buildSliceLibraryDirectoryPath = (
	args: BuildSliceLibraryDirectoryPathArgs,
): string => {
	return args.absolute
		? args.helpers.joinPathFromRoot(args.libraryID)
		: path.join(args.libraryID);
};
