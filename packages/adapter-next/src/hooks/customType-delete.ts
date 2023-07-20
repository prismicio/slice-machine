import type { CustomTypeDeleteHook } from "@slicemachine/plugin-kit";
import {
	deleteAllCustomTypeFiles,
	upsertGlobalTypeScriptTypes,
} from "@slicemachine/adapter-universal";

import { rejectIfNecessary } from "../lib/rejectIfNecessary";

import type { PluginOptions } from "../types";

export const customTypeDelete: CustomTypeDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	rejectIfNecessary(
		await Promise.allSettled([
			deleteAllCustomTypeFiles({
				customTypeID: data.model.id,
				helpers: context.helpers,
			}),
			upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				helpers: context.helpers,
				actions: context.actions,
			}),
		]),
	);
};
