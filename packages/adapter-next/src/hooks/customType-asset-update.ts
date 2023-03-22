import type { CustomTypeAssetUpdateHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildCustomTypeAssetPath } from "../lib/buildCustomTypeAssetPath";

import type { PluginOptions } from "../types";

export const customTypeAssetUpdate: CustomTypeAssetUpdateHook<
	PluginOptions
> = async (data, context) => {
	const filePath = buildCustomTypeAssetPath({
		customTypeID: data.customTypeID,
		assetID: data.asset.id,
		helpers: context.helpers,
	});

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, data.asset.data);
};
