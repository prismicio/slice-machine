import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { SHARED_SLICE_MODEL_FILENAME } from "./constants";
import { writeSliceFile, WriteSliceFileArgs } from "./writeSliceFile";

export type WriteSliceModelArgs = Omit<
	WriteSliceFileArgs,
	"filename" | "contents" | "sliceID"
> & {
	model: SharedSlice;
};

/**
 * Writes a Slice model to the file system in the Slice's Slice library.
 *
 * @returns The file path to the written model.
 */
export const writeSliceModel = async (
	args: WriteSliceModelArgs,
): Promise<string> => {
	return await writeSliceFile({
		...args,
		filename: SHARED_SLICE_MODEL_FILENAME,
		contents: JSON.stringify(args.model, null, 2),
	});
};
