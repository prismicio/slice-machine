import type { CustomTypeAssetReadHook } from "@slicemachine/plugin-kit";
import { readCustomTypeFile } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeAssetRead: CustomTypeAssetReadHook<
	PluginOptions
> = async (data, context) => {
	const customTypeFile = await readCustomTypeFile({
		customTypeID: data.customTypeID,
		filename: data.assetID,
		helpers: context.helpers,
	});

	return {
		data: customTypeFile,
	};
};
