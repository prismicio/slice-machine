import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

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
