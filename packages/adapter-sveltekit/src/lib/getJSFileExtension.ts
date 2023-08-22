import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";

import { checkIsTypeScriptProject } from "./checkIsTypeScriptProject";

type GetJSFileExtensionArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers" | "options"
>;

export const getJSFileExtension = async ({
	helpers,
	options,
}: GetJSFileExtensionArgs): Promise<string> => {
	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	return isTypeScriptProject ? "ts" : "js";
};
