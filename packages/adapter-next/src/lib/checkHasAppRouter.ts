import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { checkHasProjectFile } from "@slicemachine/plugin-kit/fs";
import * as path from "node:path";

import { PluginOptions } from "../types";
import { checkHasSrcDirectory } from "./checkHasSrcDirectory";

type CheckHasAppRouterArgs = Pick<
	SliceMachineContext<PluginOptions>,
	"helpers"
>;

export async function checkHasAppRouter(
	args: CheckHasAppRouterArgs,
): Promise<boolean> {
	const hasSrcDirectory = await checkHasSrcDirectory({ helpers: args.helpers });

	return await checkHasProjectFile({
		filename: hasSrcDirectory ? path.join("src", "app") : "app",
		helpers: args.helpers,
	});
}
