import {
	buildCustomTypeDirectoryPath,
	BuildCustomTypeDirectoryPathArgs,
} from "./buildCustomTypeDirectoryPath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteCustomTypeDirectoryArgs = BuildCustomTypeDirectoryPathArgs;

export const deleteCustomTypeDirectory = async (
	args: DeleteCustomTypeDirectoryArgs,
): Promise<string> => {
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
};
