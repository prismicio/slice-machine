import * as path from "node:path";

import {
	buildCustomTypeDirectoryPath,
	BuildCustomTypeDirectoryPathArgs,
} from "./buildCustomTypeDirectoryPath";

export type BuildCustomTypeFilePathArgs = {
	filename: string;
} & BuildCustomTypeDirectoryPathArgs;

export const buildCustomTypeFilePath = (
	args: BuildCustomTypeFilePathArgs,
): string => {
	return path.join(buildCustomTypeDirectoryPath(args), args.filename);
};
