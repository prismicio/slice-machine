import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { checkHasProjectFile } from "@slicemachine/plugin-kit/fs";

import { PluginOptions } from "../types";

type CheckHasAppDirectoryArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasAppDirectory(
	args: CheckHasAppDirectoryArgs,
): Promise<boolean> {
	return await checkHasProjectFile({
		filename: "app",
		helpers: args.helpers,
	});
}
