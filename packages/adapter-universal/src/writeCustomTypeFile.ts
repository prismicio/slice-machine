import { writeFile, WriteFileArgs } from "./lib/writeFile";

import {
	buildCustomTypeFilePath,
	BuildCustomTypeFilePathArgs,
} from "./buildCustomTypeFilePath";

export type WriteCustomTypeFileArgs = Omit<WriteFileArgs, "filePath"> &
	BuildCustomTypeFilePathArgs;

/**
 * Writes a custom type model to the file system.
 *
 * @returns The file path to the written file.
 */
export async function writeCustomTypeFile(
	args: WriteCustomTypeFileArgs,
): Promise<string> {
	const filePath = buildCustomTypeFilePath(args);

	return await writeFile({
		...args,
		filePath,
	});
}
