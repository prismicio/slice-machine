import { checkPathExists } from "./lib/checkPathExists";

import { PluginSystemHelpers } from "../createPluginSystemHelpers";

export type CheckHasProjectFileArgs = {
	filename: string;
	helpers: PluginSystemHelpers;
};

export const checkHasProjectFile = async (
	args: CheckHasProjectFileArgs,
): Promise<boolean> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	return checkPathExists(filePath);
};
