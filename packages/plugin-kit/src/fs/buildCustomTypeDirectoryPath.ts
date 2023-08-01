import * as path from "node:path";

import {
	buildCustomTypeLibraryDirectoryPath,
	BuildCustomTypeLibraryDirectoryPathArgs,
} from "./buildCustomTypeLibraryDirectoryPath";

export type BuildCustomTypeDirectoryPathArgs = {
	customTypeID: string;
} & BuildCustomTypeLibraryDirectoryPathArgs;

export const buildCustomTypeDirectoryPath = (
	args: BuildCustomTypeDirectoryPathArgs,
): string => {
	return path.join(
		buildCustomTypeLibraryDirectoryPath(args),
		args.customTypeID,
	);
};
