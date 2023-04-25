import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineContext } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { PluginOptions } from "../types";

import { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";
import { pascalCase } from "./pascalCase";

type BuildSliceDirectoryPathArgs = {
	libraryID: string;
	model: SharedSlice;
	helpers: SliceMachineContext<PluginOptions>["helpers"];
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
