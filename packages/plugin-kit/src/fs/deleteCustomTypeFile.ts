import {
	buildCustomTypeFilePath,
	BuildCustomTypeFilePathArgs,
} from "./buildCustomTypeFilePath";
import { deleteProjectFile } from "./deleteProjectFile";

export type DeleteCustomTypeFileArgs = BuildCustomTypeFilePathArgs;

export const deleteCustomTypeFile = async (
	args: DeleteCustomTypeFileArgs,
): Promise<string> => {
	const filePath = buildCustomTypeFilePath(args);
	const relativeFilePath = buildCustomTypeFilePath({
		...args,
		absolute: false,
	});

	await deleteProjectFile({
		filename: relativeFilePath,
		helpers: args.helpers,
	});

	return filePath;
};
