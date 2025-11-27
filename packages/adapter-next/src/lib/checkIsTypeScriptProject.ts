import { PluginSystemContext } from "@prismicio/plugin-kit";
import { checkIsTypeScriptProject as baseCheckIsTypeScriptProject } from "@prismicio/plugin-kit/fs";

import { PluginOptions } from "../types";

type CheckIsTypeScriptProjectArgs = {
	helpers: PluginSystemContext<PluginOptions>["helpers"];
	options: PluginSystemContext<PluginOptions>["options"];
};

export const checkIsTypeScriptProject = async (
	args: CheckIsTypeScriptProjectArgs,
): Promise<boolean> => {
	return (
		args.options.typescript ??
		baseCheckIsTypeScriptProject({ helpers: args.helpers })
	);
};
