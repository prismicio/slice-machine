import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { buildCustomTypeLibraryDirectoryPath } from "./buildCustomTypeLibraryDirectoryPath";

export type BuildCustomTypeDirectoryPathArgs = {
	customTypeID: string;
	helpers: SliceMachineHelpers;
};

export const buildCustomTypeDirectoryPath = (
	args: BuildCustomTypeDirectoryPathArgs,
): string => {
	return path.join(
		buildCustomTypeLibraryDirectoryPath({ helpers: args.helpers }),
		args.customTypeID,
	);
};
