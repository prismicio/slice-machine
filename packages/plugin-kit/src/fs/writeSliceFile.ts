import {
	buildSliceFilePath,
	BuildSliceFilePathArgs,
} from "./buildSliceFilePath";
import { writeProjectFile, WriteProjectFileArgs } from "./writeProjectFile";

export type WriteSliceFileArgs = Omit<WriteProjectFileArgs, "filePath"> &
	BuildSliceFilePathArgs;

/**
 * Writes a Slice model to the file system in the Slice's Slice library.
 *
 * @returns The file path to the written file.
 */
export const writeSliceFile = async (
	args: WriteSliceFileArgs,
): Promise<string> => {
	const filePath = await buildSliceFilePath(args);
	const relativeFilePath = await buildSliceFilePath({
		...args,
		absolute: false,
	});

	await writeProjectFile({
		...args,
		filename: relativeFilePath,
	});

	return filePath;
};
