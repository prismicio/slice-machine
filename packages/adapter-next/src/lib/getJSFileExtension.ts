import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";

import { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

type GetJSFileExtensionArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers" | "options"
> & {
	jsx?: boolean;
};

export const getJSFileExtension = async ({
	helpers,
	options,
	jsx = false,
}: GetJSFileExtensionArgs): Promise<string> => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (isTypeScriptProject) {
		return jsx ? "tsx" : "ts";
	} else {
		return jsx && options.jsxExtension ? "jsx" : "js";
	}
};
