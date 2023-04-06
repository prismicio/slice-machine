import type { CustomTypeAssetDeleteHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildCustomTypeAssetPath } from "../lib/buildCustomTypeAssetPath";

import type { PluginOptions } from "../types";

export const customTypeAssetDelete: CustomTypeAssetDeleteHook<
	PluginOptions
> = async (data, context) => {
	const filePath = buildCustomTypeAssetPath({
		customTypeID: data.customTypeID,
		assetID: data.assetID,
		helpers: context.helpers,
	});

	await fs.rm(filePath);
};
