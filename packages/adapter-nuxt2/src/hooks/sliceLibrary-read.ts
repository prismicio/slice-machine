import type { SliceLibraryReadHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildSliceLibraryDirectoryPath } from "../lib/buildSliceLibraryDirectoryPath";
import { isSharedSliceModel } from "../lib/isSharedSliceModel";
import { readJSONFile } from "../lib/readJSONFile";

import type { PluginOptions } from "../types";

export const sliceLibraryRead: SliceLibraryReadHook<PluginOptions> = async (
	data,
	{ helpers },
) => {
	const dir = buildSliceLibraryDirectoryPath({
		libraryID: data.libraryID,
		helpers,
	});

	// Ensure the directory exists.
	await fs.mkdir(dir, { recursive: true });

	const childDirs = await fs.readdir(dir, { withFileTypes: true });

	const sliceIDs: string[] = [];
	await Promise.all(
		childDirs.map(async (childDir) => {
			if (childDir.isDirectory()) {
				const modelPath = path.join(dir, childDir.name, "model.json");

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
		id: data.libraryID,
		sliceIDs: sliceIDs.sort(),
	};
};
