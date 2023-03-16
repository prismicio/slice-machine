import type {
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildCustomTypeDirectoryPath } from "../lib/buildCustomTypeDirectoryPath";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";

import type { PluginOptions } from "../types";

type Args = {
	dir: string;
	data: CustomTypeCreateHookData;
} & SliceMachineContext<PluginOptions>;

const createModelFile = async ({ dir, data, helpers, options }: Args) => {
	const filePath = path.join(dir, "index.json");

	let contents = JSON.stringify(data.model);

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};

export const customTypeCreate: CustomTypeCreateHook<PluginOptions> = async (
	data,
	context,
) => {
	const dir = buildCustomTypeDirectoryPath({
		customTypeID: data.model.id,
		helpers: context.helpers,
	});

	await fs.mkdir(dir, { recursive: true });

	await createModelFile({ dir, data, ...context });

	await upsertGlobalContentTypes(context);
};
