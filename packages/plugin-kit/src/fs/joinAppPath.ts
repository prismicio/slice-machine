import * as path from "node:path";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

import { checkHasProjectFile } from "./checkHasProjectFile";

export type JoinAppPathArgs = {
	appDirs: string[];
	helpers: SliceMachineHelpers;
};

export const joinAppPath = async (
	args: JoinAppPathArgs,
	...segments: string[]
): Promise<string> => {
	for (const appDir of args.appDirs) {
		const hasAppDir = await checkHasProjectFile({
			filename: appDir,
			helpers: args.helpers,
		});

		if (hasAppDir) {
			return path.join(appDir, ...segments);
		}
	}

	return path.join(...segments);
};
