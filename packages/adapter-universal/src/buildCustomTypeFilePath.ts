import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { buildCustomTypeDirectoryPath } from "./buildCustomTypeDirectoryPath";

export type BuildCustomTypeFilePathArgs = {
	customTypeID: string;
	filename: string;
	helpers: SliceMachineHelpers;
};

export const buildCustomTypeFilePath = (
	args: BuildCustomTypeFilePathArgs,
): string => {
	return path.join(
		buildCustomTypeDirectoryPath({
			customTypeID: args.customTypeID,
			helpers: args.helpers,
		}),
		args.filename,
	);
};
