import type { CustomTypeReadHook } from "@slicemachine/plugin-kit";
import { readCustomTypeModel } from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeRead: CustomTypeReadHook<PluginOptions> = async (
	data,
	context,
) => {
	return readCustomTypeModel({
		customTypeID: data.id,
		helpers: context.helpers,
	});
};
