import type { CustomTypeReadHook } from "@slicemachine/plugin-kit";
import * as prismicT from "@prismicio/types";
import * as path from "node:path";

import { buildCustomTypeDirectoryPath } from "../lib/buildCustomTypeDirectoryPath";
import { readJSONFile } from "../lib/readJSONFile";

import type { PluginOptions } from "../types";

export const customTypeRead: CustomTypeReadHook<PluginOptions> = async (
	data,
	{ helpers },
) => {
	const filePath = path.join(
		buildCustomTypeDirectoryPath({ customTypeID: data.id, helpers }),
		"index.json",
	);

	const model = await readJSONFile<prismicT.CustomTypeModel>(filePath);

	return {
		model,
	};
};
