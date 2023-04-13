import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineContext } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { PluginOptions } from "../types";

import { buildSliceDirectoryPath } from "./buildSliceDirectoryPath";

type UpdateSliceModelFileArgs = {
	libraryID: string;
	model: SharedSlice;
} & SliceMachineContext<PluginOptions>;

export const updateSliceModelFile = async ({
	libraryID,
	model,
	helpers,
	options,
}: UpdateSliceModelFileArgs): Promise<void> => {
	const filePath = path.join(
		buildSliceDirectoryPath({ libraryID, model, helpers }),
		"model.json",
	);

	let contents = JSON.stringify(model);

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};
