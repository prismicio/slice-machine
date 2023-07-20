import type { CustomTypeAssetDeleteHook } from "@slicemachine/plugin-kit";
import { deleteCustomTypeFile } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeAssetDelete: CustomTypeAssetDeleteHook<
	PluginOptions
> = async (data, context) => {
	await deleteCustomTypeFile({
		customTypeID: data.customTypeID,
		filename: data.assetID,
		helpers: context.helpers,
	});
};
