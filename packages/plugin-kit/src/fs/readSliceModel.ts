import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";
import * as path from "node:path";

import { PluginSystemHelpers } from "../createPluginSystemHelpers";

import { checkPathExists } from "./lib/checkPathExists";
import { isSharedSliceModel } from "./lib/isSharedSliceModel";
import { readJSONFile } from "./lib/readJSONFile";
import * as fs from "./lib/fsLimit";

import { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";
import { SHARED_SLICE_MODEL_FILENAME } from "./constants";

export type ReadSliceModelArgs = {
	libraryID: string;
	sliceID: string;
	helpers: PluginSystemHelpers;
};

export type ReadSliceModelReturnType = {
	model: TypesInternal.SharedSlice;
};

export const readSliceModel = async (
	args: ReadSliceModelArgs,
): Promise<ReadSliceModelReturnType> => {
	const libraryDir = buildSliceLibraryDirectoryPath({
		libraryID: args.libraryID,
		absolute: true,
		helpers: args.helpers,
	});

	if (await checkPathExists(libraryDir)) {
		const childDirs = await fs.readdir(libraryDir, { withFileTypes: true });

		/**
		 * Paths to models that could not be read due to invalid JSON.
		 */
		const unreadableModelPaths: string[] = [];

		// Find the first matching model.
		const models: (TypesInternal.SharedSlice | undefined)[] = await Promise.all(
			childDirs.map(async (childDir) => {
				if (childDir.isDirectory()) {
					const modelPath = path.join(
						libraryDir,
						childDir.name,
						SHARED_SLICE_MODEL_FILENAME,
					);

					try {
						const modelContents = await readJSONFile(modelPath);

						if (
							isSharedSliceModel(modelContents) &&
							modelContents.id === args.sliceID
						) {
							return modelContents;
						}
					} catch {
						unreadableModelPaths.push(modelPath);
					}
				}
			}),
		);
		const [model] = models.filter(
			(model): model is TypesInternal.SharedSlice =>
				isSharedSliceModel(model),
		);

		if (model) {
			return {
				model,
			};
		} else {
			if (unreadableModelPaths.length > 0) {
				throw new Error(
					`Did not find a Slice model with ID "${args.sliceID}" in the "${
						args.libraryID
					}" Slice Library. The following Slice models could not be read: [${unreadableModelPaths.join(
						", ",
					)}]`,
				);
			}
		}
	}

	throw new Error(
		`Did not find a Slice model with ID "${args.sliceID}" in the "${args.libraryID}" Slice Library.`,
	);
};
