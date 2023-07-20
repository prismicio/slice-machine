import {
	buildSliceDirectoryPath,
	BuildSliceDirectoryPathArgs,
} from "./buildSliceDirectoryPath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteAllSliceFilesArgs = BuildSliceDirectoryPathArgs;

export async function deleteAllSliceFiles(
	args: DeleteAllSliceFilesArgs,
): Promise<string> {
	const dir = await buildSliceDirectoryPath(args);
	const relativeDir = await buildSliceDirectoryPath({
		...args,
		absolute: false,
	});

	await deleteProjectFile({
		filename: relativeDir,
		helpers: args.helpers,
	});

	return dir;
}
