import * as fs from "node:fs/promises";

import {
	buildSliceDirectoryPath,
	BuildSliceDirectoryPathArgs,
} from "./buildSliceDirectoryPath";

export type DeleteAllSliceFilesArgs = BuildSliceDirectoryPathArgs;

export async function deleteAllSliceFiles(
	args: DeleteAllSliceFilesArgs,
): Promise<string> {
	const dir = await buildSliceDirectoryPath(args);

	await fs.rm(dir, { recursive: true });

	return dir;
}
