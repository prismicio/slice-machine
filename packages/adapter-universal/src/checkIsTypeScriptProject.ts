import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { TSCONFIG_FILENAME } from "./constants";

type CheckIsTypeScriptProjectArgs = {
	helpers: SliceMachineHelpers;
};

export const checkIsTypeScriptProject = async (
	args: CheckIsTypeScriptProjectArgs,
): Promise<boolean> => {
	try {
		await fs.access(args.helpers.joinPathFromRoot(TSCONFIG_FILENAME));

		return true;
	} catch {
		return false;
	}
};
