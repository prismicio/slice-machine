import * as fs from "node:fs/promises";
import * as path from "node:path";

import { checkPathExists } from "./lib/checkPathExists";
import { isSharedSliceModel } from "./lib/isSharedSliceModel";
import { readJSONFile } from "./lib/readJSONFile";

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

	const sliceIDs: string[] = [];
	await Promise.all(
		childDirs.map(async (childDir) => {
			if (childDir.isDirectory()) {
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
					// noop
				}
			}
		}),
	);

	return {
		id: args.libraryID,
		sliceIDs: sliceIDs.sort(),
	};
};
