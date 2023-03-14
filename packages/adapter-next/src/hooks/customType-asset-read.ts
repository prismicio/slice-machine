import type { CustomTypeAssetReadHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildCustomTypeAssetPath } from "../lib/buildCustomTypeAssetPath";

import type { PluginOptions } from "../types";

export const customTypeAssetRead: CustomTypeAssetReadHook<
	PluginOptions
> = async (data, context) => {
	const filePath = buildCustomTypeAssetPath({
		customTypeID: data.customTypeID,
		assetID: data.assetID,
		helpers: context.helpers,
	});

	const assetData = await fs.readFile(filePath);

	return {
		data: assetData,
	};
};
