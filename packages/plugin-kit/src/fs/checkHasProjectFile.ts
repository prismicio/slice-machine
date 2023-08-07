import { checkPathExists } from "./lib/checkPathExists";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

export type CheckHasProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export const checkHasProjectFile = async (
	args: CheckHasProjectFileArgs,
): Promise<boolean> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	return checkPathExists(filePath);
};
