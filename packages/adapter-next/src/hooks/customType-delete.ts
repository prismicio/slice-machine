import type { CustomTypeDeleteHook } from "@slicemachine/plugin-kit";
import {
	deleteAllCustomTypeFiles,
	upsertGlobalTypeScriptTypes,
} from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeDelete: CustomTypeDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	await deleteAllCustomTypeFiles({
		customTypeID: data.model.id,
		helpers: context.helpers,
	});

	await upsertGlobalTypeScriptTypes({
		filename: context.options.generatedTypesFilePath,
		format: context.options.format,
		helpers: context.helpers,
		actions: context.actions,
	});
};
