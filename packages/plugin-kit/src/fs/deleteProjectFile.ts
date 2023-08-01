import * as fs from "node:fs/promises";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

export type DeleteProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export async function deleteProjectFile(
	args: DeleteProjectFileArgs,
): Promise<string> {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	await fs.rm(filePath, { recursive: true });

	return filePath;
}
