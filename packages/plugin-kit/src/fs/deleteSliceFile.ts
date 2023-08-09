import {
	buildSliceFilePath,
	BuildSliceFilePathArgs,
} from "./buildSliceFilePath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteSliceFileArgs = BuildSliceFilePathArgs;

export const deleteSliceFile = async (
	args: DeleteSliceFileArgs,
): Promise<string> => {
	const filePath = await buildSliceFilePath(args);
	const relativeFilePath = await buildSliceFilePath({
		...args,
		absolute: false,
	});

	await deleteProjectFile({
		filename: relativeFilePath,
		helpers: args.helpers,
	});

	return filePath;
};
