import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { checkHasProjectFile, joinAppPath } from "@slicemachine/plugin-kit/fs";

import { PluginOptions } from "../types";

type CheckHasAppRouterArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasAppRouter(
	args: CheckHasAppRouterArgs,
): Promise<boolean> {
	const appRouterPath = await joinAppPath(
		{
			appDirs: ["src"],
			helpers: args.helpers,
		},
		"app",
	);

	return await checkHasProjectFile({
		filename: appRouterPath,
		helpers: args.helpers,
	});
}
