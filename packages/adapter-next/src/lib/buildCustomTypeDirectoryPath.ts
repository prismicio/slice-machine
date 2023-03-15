import { SliceMachineContext } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { PluginOptions } from "../types";

import { buildCustomTypeLibraryDirectoryPath } from "./buildCustomTypeLibraryDirectoryPath";

type BuildCustomTypeDirectoryPathArgs = {
	customTypeID: string;
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

export const buildCustomTypeDirectoryPath = (
	args: BuildCustomTypeDirectoryPathArgs,
): string => {
	return path.join(
		buildCustomTypeLibraryDirectoryPath({ helpers: args.helpers }),
		args.customTypeID,
	);
};
