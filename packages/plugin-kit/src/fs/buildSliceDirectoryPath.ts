import * as path from "node:path";

import { pascalCase } from "./lib/pascalCase";
import {
	resolveSliceModel,
	ResolveSliceModelArgs,
} from "./lib/resolveSliceModel";

import {
	buildSliceLibraryDirectoryPath,
	BuildSliceLibraryDirectoryPathArgs,
} from "./buildSliceLibraryDirectoryPath";

export type BuildSliceDirectoryPathArgs = BuildSliceLibraryDirectoryPathArgs &
	ResolveSliceModelArgs;

export const buildSliceDirectoryPath = async (
	args: BuildSliceDirectoryPathArgs,
): Promise<string> => {
	const model = await resolveSliceModel(args);

	return path.join(
		buildSliceLibraryDirectoryPath(args),
		pascalCase(model.name),
	);
};
