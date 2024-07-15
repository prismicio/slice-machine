import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { checkHasProjectFile } from "@slicemachine/plugin-kit/fs";

import { PluginOptions } from "../types";

import { buildSrcPath } from "./buildSrcPath";

type CheckHasAppRouterArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasAppRouter(
	args: CheckHasAppRouterArgs,
): Promise<boolean> {
	const appRouterPath = await buildSrcPath({
		filename: "app",
		helpers: args.helpers,
	});

	return await checkHasProjectFile({
		filename: appRouterPath,
		helpers: args.helpers,
	});
}
