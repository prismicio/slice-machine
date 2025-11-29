// TODO: If Nuxt provides a way to read `nuxt.config.js`'s `srcDir` value, we
// can use the exact value given. The current implementation does not support
// custom values different than "app" or "src".
import * as path from "node:path";

import { PluginSystemHelpers } from "@prismicio/plugin-kit";
import { checkHasProjectFile } from "@prismicio/plugin-kit/fs";

export async function buildSrcPath(args: {
	filename: string;
	helpers: PluginSystemHelpers;
}): Promise<string> {
	const hasAppDirectory = await checkHasProjectFile({
		filename: "app",
		helpers: args.helpers,
	});
	if (hasAppDirectory) {
		return path.join("app", args.filename);
	}

	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers: args.helpers,
	});
	if (hasSrcDirectory) {
		return path.join("src", args.filename);
	}

	return args.filename;
}
