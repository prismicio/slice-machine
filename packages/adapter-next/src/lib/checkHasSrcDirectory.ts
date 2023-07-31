import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { checkHasProjectFile } from "@slicemachine/plugin-kit/fs";

import { PluginOptions } from "../types";

type CheckHasSrcDirectoryArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasSrcDirectory(
	args: CheckHasSrcDirectoryArgs,
): Promise<boolean> {
	return await checkHasProjectFile({
		filename: "src",
		helpers: args.helpers,
	});
}
