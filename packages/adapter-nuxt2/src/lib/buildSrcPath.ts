// TODO: If Nuxt provides a way to read `nuxt.config.js`'s `srcDir` value, we
// can use the exact value given. The current implementation does not support
// custom values different than "src".

import * as path from "node:path";

import type { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import { checkHasProjectFile } from "@slicemachine/plugin-kit/fs";

export async function buildSrcPath(args: {
	filename: string;
	helpers: SliceMachineHelpers;
}): Promise<string> {
	const hasSrcDirectory = await checkHasProjectFile({
		filename: "src",
		helpers: args.helpers,
	});

	return hasSrcDirectory ? path.join("src", args.filename) : args.filename;
}
