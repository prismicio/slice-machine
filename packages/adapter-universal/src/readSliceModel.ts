import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { checkPathExists } from "./lib/checkPathExists";
import { readJSONFile } from "./lib/readJSONFile";

import { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";
import { isSharedSliceModel } from "./lib/isSharedSliceModel";

export type ReadSliceModelArgs = {
	libraryID: string;
	sliceID: string;
	helpers: SliceMachineHelpers;
};

export type ReadSliceModelReturnType = {
	model: SharedSlice;
};

export async function readSliceModel(
	args: ReadSliceModelArgs,
): Promise<ReadSliceModelReturnType> {
	const libraryDir = buildSliceLibraryDirectoryPath({
		libraryID: args.libraryID,
		helpers: args.helpers,
	});

	const libraryDirExists = await checkPathExists(libraryDir);

	if (!libraryDirExists) {
		throw new Error(
			`Did not find a Slice model with ID "${args.sliceID}" in the "${args.libraryID}" Slice Library.`,
		);
	}

	const childDirs = await fs.readdir(libraryDir, { withFileTypes: true });

	const modelReadErrors: string[] = [];

	// Find the first matching model.
	const [model] = (
		await Promise.all(
			childDirs.map(async (childDir) => {
				if (childDir.isDirectory()) {
					const modelPath = path.join(libraryDir, childDir.name, "model.json");
					try {
						const modelContents = await readJSONFile(modelPath);

						if (
							isSharedSliceModel(modelContents) &&
							modelContents.id === args.sliceID
						) {
							return modelContents;
						}
					} catch (error) {
						modelReadErrors.push(modelPath);
					}
				}
			}),
		)
	).filter((model): model is NonNullable<typeof model> => Boolean(model));

	if (model) {
		return {
			model,
		};
	} else {
		if (modelReadErrors.length) {
			throw new Error(
				`Did not find a Slice model with ID "${args.sliceID}" in the "${
					args.libraryID
				}" Slice Library.\n\nThose Slice models could not be read:\n  - ${modelReadErrors.join(
					"\n  - ",
				)}`,
			);
		}

		throw new Error(
			`Did not find a Slice model with ID "${args.sliceID}" in the "${args.libraryID}" Slice Library.`,
		);
	}
}
