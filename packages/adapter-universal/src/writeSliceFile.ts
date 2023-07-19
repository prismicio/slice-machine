import { writeFile, WriteFileArgs } from "./lib/writeFile";

import {
	buildSliceFilePath,
	BuildSliceFilePathArgs,
} from "./buildSliceFilePath";

export type WriteSliceFileArgs = Omit<WriteFileArgs, "filePath"> &
	BuildSliceFilePathArgs;

/**
 * Writes a Slice model to the file system in the Slice's Slice library.
 *
 * @returns The file path to the written file.
 */
export async function writeSliceFile(
	args: WriteSliceFileArgs,
): Promise<string> {
	const filePath = await buildSliceFilePath(args);

	return await writeFile({
		...args,
		filePath,
	});
}
