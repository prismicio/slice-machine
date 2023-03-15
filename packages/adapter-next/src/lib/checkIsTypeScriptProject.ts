import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";
import { checkPathExists } from "./checkPathExists";

type CheckIsTypeScriptProjectArgs = {
	helpers: SliceMachineContext<PluginOptions>["helpers"];
	options: SliceMachineContext<PluginOptions>["options"];
};

export const checkIsTypeScriptProject = async (
	args: CheckIsTypeScriptProjectArgs,
): Promise<boolean> => {
	const tsConfigPath = args.helpers.joinPathFromRoot("tsconfig.json");

	return args.options.typescript ?? (await checkPathExists(tsConfigPath));
};
