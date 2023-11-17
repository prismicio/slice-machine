import { SliceMachineHelpers } from "../createSliceMachineHelpers";

import * as fs from "./lib/fsLimit";

export type DeleteProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export const deleteProjectFile = async (
	args: DeleteProjectFileArgs,
): Promise<string> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	await fs.rm(filePath, { recursive: true });

	return filePath;
};
