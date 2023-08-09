import {
	buildSliceDirectoryPath,
	BuildSliceDirectoryPathArgs,
} from "./buildSliceDirectoryPath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteSliceDirectoryArgs = BuildSliceDirectoryPathArgs;

export const deleteSliceDirectory = async (
	args: DeleteSliceDirectoryArgs,
): Promise<string> => {
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
};
