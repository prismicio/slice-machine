import { checkHasProjectFile } from "@slicemachine/adapter-universal";
import { SliceMachineContext } from "@slicemachine/plugin-kit";

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
