import { SliceMachineContext } from "@slicemachine/plugin-kit";

import { PluginOptions } from "../types";
import { checkHasSrcDirectory } from "./checkHasSrcDirectory";
import { checkPathExists } from "./checkPathExists";

type CheckHasAppRouterArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasAppRouter(
	args: CheckHasAppRouterArgs,
): Promise<boolean> {
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers: args.helpers });

	return await checkPathExists(
		hasSrcDirectory
			? args.helpers.joinPathFromRoot("src", "app")
			: args.helpers.joinPathFromRoot("app"),
	);
}
