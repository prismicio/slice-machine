import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";
import { checkPathExists } from "./checkPathExists";

type CheckHasSrcDirectoryArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasSrcDirectory(
	args: CheckHasSrcDirectoryArgs,
): Promise<boolean> {
	return await checkPathExists(args.helpers.joinPathFromRoot("src"));
}
