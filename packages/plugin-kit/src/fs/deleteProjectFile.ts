import * as fs from "node:fs/promises";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";
import { fsLimit } from "./lib/fsLimit";

export type DeleteProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export const deleteProjectFile = async (
	args: DeleteProjectFileArgs,
): Promise<string> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	await fsLimit(() => fs.rm(filePath, { recursive: true }));

	return filePath;
};
