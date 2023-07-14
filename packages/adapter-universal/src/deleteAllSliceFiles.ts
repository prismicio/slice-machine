import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildSliceDirectoryPath } from "./buildSliceDirectoryPath";

export type DeleteAllSliceFilesArgs = {
	libraryID: string;
	model: SharedSlice;
	helpers: SliceMachineHelpers;
};

export async function deleteAllSliceFiles(
	args: DeleteAllSliceFilesArgs,
): Promise<string> {
	const dir = buildSliceDirectoryPath({
		libraryID: args.libraryID,
		model: args.model,
		helpers: args.helpers,
	});

	await fs.rm(dir, { recursive: true });

	return dir;
}
