import {
	buildCustomTypeFilePath,
	BuildCustomTypeFilePathArgs,
} from "./buildCustomTypeFilePath";
import { writeProjectFile, WriteProjectFileArgs } from "./writeProjectFile";

export type WriteCustomTypeFileArgs = Omit<WriteProjectFileArgs, "filePath"> &
	BuildCustomTypeFilePathArgs;

/**
 * Writes a custom type model to the file system.
 *
 * @returns The file path to the written file.
 */
export const writeCustomTypeFile = async (
	args: WriteCustomTypeFileArgs,
): Promise<string> => {
	const filePath = buildCustomTypeFilePath(args);
	const relativeFilePath = buildCustomTypeFilePath({
		...args,
		absolute: false,
	});

	await writeProjectFile({
		...args,
		filename: relativeFilePath,
	});

	return filePath;
};
