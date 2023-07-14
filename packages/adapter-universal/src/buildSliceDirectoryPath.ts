import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { pascalCase } from "./lib/pascalCase";

import { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";

export type BuildSliceDirectoryPathArgs = {
	libraryID: string;
	model: SharedSlice;
	helpers: SliceMachineHelpers;
};

export const buildSliceDirectoryPath = (
	args: BuildSliceDirectoryPathArgs,
): string => {
	return path.join(
		buildSliceLibraryDirectoryPath({
			libraryID: args.libraryID,
			helpers: args.helpers,
		}),
		pascalCase(args.model.name),
	);
};
