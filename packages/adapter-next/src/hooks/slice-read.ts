import type { SliceReadHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildSliceLibraryDirectoryPath } from "../lib/buildSliceLibraryDirectoryPath";
import { isSharedSliceModel } from "../lib/isSharedSliceModel";
import { readJSONFile } from "../lib/readJSONFile";

import type { PluginOptions } from "../types";

export const sliceRead: SliceReadHook<PluginOptions> = async (
	data,
	{ helpers },
) => {
	const libraryDir = buildSliceLibraryDirectoryPath({
		libraryID: data.libraryID,
		helpers,
	});

	// Ensure the directory exists.
	await fs.mkdir(libraryDir, { recursive: true });

	const childDirs = await fs.readdir(libraryDir, { withFileTypes: true });

	// Find the first matching model.
	const [model] = (
		await Promise.all(
			childDirs.map(async (childDir) => {
				if (childDir.isDirectory()) {
					const modelPath = path.join(libraryDir, childDir.name, "model.json");

					const modelContents = await readJSONFile(modelPath);

					if (
						isSharedSliceModel(modelContents) &&
						modelContents.id === data.sliceID
					) {
						return modelContents;
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
		throw new Error(
			`Did not find a Slice model with ID "${data.sliceID}" in the "${data.libraryID}" Slice Library.`,
		);
	}
};
