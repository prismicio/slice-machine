import { PluginSystemContext } from "@prismicio/plugin-kit";
import { checkHasProjectFile } from "@prismicio/plugin-kit/fs";

import { PluginOptions } from "../types";

import { buildSrcPath } from "./buildSrcPath";

type CheckHasAppRouterArgs = Pick<
	PluginSystemContext<PluginOptions>,
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
