import type { SliceAssetReadHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildSliceAssetPath } from "../lib/buildSliceAssetPath";

import type { PluginOptions } from "../types";

export const sliceAssetRead: SliceAssetReadHook<PluginOptions> = async (
	data,
	context,
) => {
	const filePath = await buildSliceAssetPath({
		libraryID: data.libraryID,
		sliceID: data.sliceID,
		assetID: data.assetID,
		helpers: context.helpers,
		actions: context.actions,
	});

	const assetData = await fs.readFile(filePath);

	return {
		data: assetData,
	};
};
