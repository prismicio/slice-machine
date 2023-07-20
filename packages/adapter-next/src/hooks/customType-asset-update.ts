import { writeCustomTypeFile } from "@slicemachine/adapter-universal";
import type { CustomTypeAssetUpdateHook } from "@slicemachine/plugin-kit";

import type { PluginOptions } from "../types";

export const customTypeAssetUpdate: CustomTypeAssetUpdateHook<
	PluginOptions
> = async (data, context) => {
	await writeCustomTypeFile({
		customTypeID: data.customTypeID,
		filename: data.asset.id,
		contents: data.asset.data,
		helpers: context.helpers,
	});
};
