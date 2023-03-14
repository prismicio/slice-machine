import type { SliceAssetUpdateHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildSliceAssetPath } from "../lib/buildSliceAssetPath";

import type { PluginOptions } from "../types";

export const sliceAssetUpdate: SliceAssetUpdateHook<PluginOptions> = async (
	data,
	context,
) => {
	const filePath = await buildSliceAssetPath({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		assetID: data.asset.id,
		helpers: context.helpers,
		actions: context.actions,
	});

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, data.asset.data);
};
