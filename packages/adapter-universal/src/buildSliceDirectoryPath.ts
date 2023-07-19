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

export async function buildSliceDirectoryPath(
	args: BuildSliceDirectoryPathArgs,
): Promise<string> {
	const model = await resolveSliceModel(args);

	return path.join(
		buildSliceLibraryDirectoryPath({
			libraryID: args.libraryID,
			helpers: args.helpers,
		}),
		pascalCase(model.name),
	);
}
