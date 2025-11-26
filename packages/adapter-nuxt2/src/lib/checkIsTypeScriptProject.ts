import { SliceMachineContext } from "@prismicio/plugin-kit";
import { checkIsTypeScriptProject as baseCheckIsTypeScriptProject } from "@prismicio/plugin-kit/fs";

import { PluginOptions } from "../types";

type CheckIsTypeScriptProjectArgs = {
	helpers: SliceMachineContext<PluginOptions>["helpers"];
	options: SliceMachineContext<PluginOptions>["options"];
};

export const checkIsTypeScriptProject = async (
	args: CheckIsTypeScriptProjectArgs,
): Promise<boolean> => {
	return (
		args.options.typescript ??
		baseCheckIsTypeScriptProject({ helpers: args.helpers })
	);
};
