import type { CustomTypeCreateHook } from "@slicemachine/plugin-kit";
import {
	upsertGlobalTypeScriptTypes,
	writeCustomTypeModel,
} from "@slicemachine/adapter-universal";

import type { PluginOptions } from "../types";

export const customTypeCreate: CustomTypeCreateHook<PluginOptions> = async (
	data,
	context,
) => {
	await writeCustomTypeModel({
		model: data.model,
		format: context.options.format,
		helpers: context.helpers,
	});

	await upsertGlobalTypeScriptTypes({
		filename: context.options.generatedTypesFilePath,
		format: context.options.format,
		helpers: context.helpers,
		actions: context.actions,
	});
};
