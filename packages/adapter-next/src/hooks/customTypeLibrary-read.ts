import type { CustomTypeLibraryReadHook } from "@slicemachine/plugin-kit";
import type { CustomType } from "@prismicio/types-internal/lib/customtypes";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildCustomTypeLibraryDirectoryPath } from "../lib/buildCustomTypeLibraryDirectoryPath";
import { readJSONFile } from "../lib/readJSONFile";

import type { PluginOptions } from "../types";

const isCustomTypeModel = (
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	input: any,
): input is CustomType => {
	return typeof input === "object" && input !== null && "json" in input;
};

export const customTypeLibraryRead: CustomTypeLibraryReadHook<
	PluginOptions
> = async (_data, { helpers }) => {
	const dir = buildCustomTypeLibraryDirectoryPath({ helpers });

	// Ensure the directory exists.
	await fs.mkdir(dir, { recursive: true });

	const childDirs = await fs.readdir(dir, { withFileTypes: true });

	const ids: string[] = [];
	await Promise.all(
		childDirs.map(async (childDir) => {
			if (childDir.isDirectory()) {
				const childDirContents = await fs.readdir(
					path.join(dir, childDir.name),
					{
						withFileTypes: true,
					},
				);
				const isCustomTypeDir = childDirContents.some((entry) => {
					return entry.isFile() && entry.name === "index.json";
				});

				if (isCustomTypeDir) {
					const modelPath = path.join(dir, childDir.name, "index.json");

					const modelContents = await readJSONFile(modelPath);

					if (isCustomTypeModel(modelContents)) {
						ids.push(modelContents.id);
					}
				}
			}
		}),
	);

	return {
		ids: ids.sort(),
	};
};
