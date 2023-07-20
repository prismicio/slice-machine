import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

export type CheckHasProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export async function checkHasProjectFile(
	args: CheckHasProjectFileArgs,
): Promise<boolean> {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	try {
		await fs.access(filePath);

		return true;
	} catch {
		return false;
	}
}
