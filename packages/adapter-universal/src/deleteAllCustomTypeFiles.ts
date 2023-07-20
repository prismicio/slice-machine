import {
	buildCustomTypeDirectoryPath,
	BuildCustomTypeDirectoryPathArgs,
} from "./buildCustomTypeDirectoryPath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteAllCustomTypeFilesArgs = BuildCustomTypeDirectoryPathArgs;

export async function deleteAllCustomTypeFiles(
	args: DeleteAllCustomTypeFilesArgs,
): Promise<string> {
	const dir = buildCustomTypeDirectoryPath(args);
	const relativeDir = buildCustomTypeDirectoryPath({
		...args,
		absolute: false,
	});

	await deleteProjectFile({
		filename: relativeDir,
		helpers: args.helpers,
	});

	return dir;
}
