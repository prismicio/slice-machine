import * as path from "node:path";

import { checkPathExists } from "./lib/checkPathExists";
import { isSharedSliceModel } from "./lib/isSharedSliceModel";
import { readJSONFile } from "./lib/readJSONFile";
import * as fs from "./lib/fsLimit";

import { SHARED_SLICE_MODEL_FILENAME } from "./constants";
import {
	buildSliceLibraryDirectoryPath,
	BuildSliceLibraryDirectoryPathArgs,
} from "./buildSliceLibraryDirectoryPath";

export type ReadSliceLibraryArgs = BuildSliceLibraryDirectoryPathArgs;

export type ReadSliceLibraryReturnType = {
	id: string;
	sliceIDs: string[];
};

export const readSliceLibrary = async (
	args: ReadSliceLibraryArgs,
): Promise<ReadSliceLibraryReturnType> => {
	const libraryDir = buildSliceLibraryDirectoryPath({
		libraryID: args.libraryID,
		absolute: true,
		helpers: args.helpers,
	});

	if (!(await checkPathExists(libraryDir))) {
		return {
			id: args.libraryID,
			sliceIDs: [],
		};
	}

	const childDirs = await fs.readdir(libraryDir, { withFileTypes: true });

	/**
	 * Paths to models that could not be read due to invalid JSON.
	 */
	const unreadableModelPaths: string[] = [];

	const sliceIDs: string[] = [];
	await Promise.all(
		childDirs.map(async (childDir) => {
			if (childDir.isDirectory()) {
				const childDirContents = await fs.readdir(
					path.join(libraryDir, childDir.name),
					{
						withFileTypes: true,
					},
				);
				const isSliceDir = childDirContents.some((entry) => {
					return entry.isFile() && entry.name === SHARED_SLICE_MODEL_FILENAME;
				});

				if (isSliceDir) {
					const modelPath = path.join(
						libraryDir,
						childDir.name,
						SHARED_SLICE_MODEL_FILENAME,
					);

					try {
						const modelContents = await readJSONFile(modelPath);

						if (isSharedSliceModel(modelContents)) {
							sliceIDs.push(modelContents.id);
						}
					} catch {
						// JSON could not be read or parsed
						unreadableModelPaths.push(modelPath);
					}
				}
			}
		}),
	);

	if (unreadableModelPaths.length > 0) {
		const formattedPaths = unreadableModelPaths.join(", ");

		throw new Error(
			`The following Slice models could not be read: [${formattedPaths}]`,
		);
	}

	return {
		id: args.libraryID,
		sliceIDs: sliceIDs.sort(),
	};
};
