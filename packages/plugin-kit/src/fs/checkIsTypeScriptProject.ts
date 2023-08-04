import { TSCONFIG_FILENAME } from "./constants";
import {
	checkHasProjectFile,
	CheckHasProjectFileArgs,
} from "./checkHasProjectFile";

type CheckIsTypeScriptProjectArgs = Omit<CheckHasProjectFileArgs, "filename">;

export const checkIsTypeScriptProject = async (
	args: CheckIsTypeScriptProjectArgs,
): Promise<boolean> => {
	return checkHasProjectFile({
		...args,
		filename: TSCONFIG_FILENAME,
	});
};
