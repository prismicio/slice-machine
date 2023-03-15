import type { CustomTypeDeleteHook } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildCustomTypeDirectoryPath } from "../lib/buildCustomTypeDirectoryPath";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";

import type { PluginOptions } from "../types";

export const customTypeDelete: CustomTypeDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	const dir = buildCustomTypeDirectoryPath({
		customTypeID: data.model.id,
		helpers: context.helpers,
	});

	await fs.rm(dir, { recursive: true });

	await upsertGlobalContentTypes(context);
};
