import { SliceMachineContext } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";
import { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

type GetJSOrTSXFileExtensionArgs = {
	helpers: SliceMachineContext<PluginOptions>["helpers"];
	options: SliceMachineContext<PluginOptions>["options"];
};

export const getJSOrTSXFileExtension = async (
	args: GetJSOrTSXFileExtensionArgs,
): Promise<string> => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers: args.helpers,
		options: args.options,
	});

	if (isTypeScriptProject) {
		return "tsx";
	} else if (args.options.jsxExtension) {
		return "jsx";
	} else {
		return "js";
	}
};
