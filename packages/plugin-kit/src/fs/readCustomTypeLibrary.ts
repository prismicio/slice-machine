import * as fs from "node:fs/promises";
import * as path from "node:path";

import { checkPathExists } from "./lib/checkPathExists";
import { isCustomTypeModel } from "./lib/isCustomTypeModel";
import { readJSONFile } from "./lib/readJSONFile";

import { CUSTOM_TYPE_MODEL_FILENAME } from "./constants";
import {
	buildCustomTypeLibraryDirectoryPath,
	BuildCustomTypeLibraryDirectoryPathArgs,
} from "./buildCustomTypeLibraryDirectoryPath";

export type ReadCustomTypeLibraryArgs = BuildCustomTypeLibraryDirectoryPathArgs;

export type ReadCustomTypeLibraryReturnType = {
	ids: string[];
};

export const readCustomTypeLibrary = async (
	args: ReadCustomTypeLibraryArgs,
): Promise<ReadCustomTypeLibraryReturnType> => {
	const libraryDir = buildCustomTypeLibraryDirectoryPath({
		absolute: true,
		helpers: args.helpers,
	});

	if (!(await checkPathExists(libraryDir))) {
		return {
			ids: [],
		};
	}

	const childDirs = await fs.readdir(libraryDir, { withFileTypes: true });

	/**
	 * Paths to models that could not be read due to invalid JSON.
	 */
	const unreadableModelPaths: string[] = [];

	const ids: string[] = [];
	await Promise.all(
		childDirs.map(async (childDir) => {
			if (childDir.isDirectory()) {
				const childDirContents = await fs.readdir(
					path.join(libraryDir, childDir.name),
					{
						withFileTypes: true,
					},
				);
				const isCustomTypeDir = childDirContents.some((entry) => {
					return entry.isFile() && entry.name === CUSTOM_TYPE_MODEL_FILENAME;
				});

				if (isCustomTypeDir) {
					const modelPath = path.join(
						libraryDir,
						childDir.name,
						CUSTOM_TYPE_MODEL_FILENAME,
					);

					try {
						const modelContents = await readJSONFile(modelPath);

						if (isCustomTypeModel(modelContents)) {
							ids.push(modelContents.id);
						}
					} catch {
						unreadableModelPaths.push(modelPath);
					}
				}
			}
		}),
	);

	if (unreadableModelPaths.length > 0) {
		const formattedPaths = unreadableModelPaths.join(", ");

		throw new Error(
			`The following custom type models could not be read: [${formattedPaths}]`,
		);
	}

	return {
		ids: ids.sort(),
	};
};
