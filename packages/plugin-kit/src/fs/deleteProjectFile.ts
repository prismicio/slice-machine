import { PluginSystemHelpers } from "../createPluginSystemHelpers";

import * as fs from "./lib/fsLimit";

export type DeleteProjectFileArgs = {
	filename: string;
	helpers: PluginSystemHelpers;
};

export const deleteProjectFile = async (
	args: DeleteProjectFileArgs,
): Promise<string> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	await fs.rm(filePath, { recursive: true });

	return filePath;
};
