import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { MODEL_FILENAME } from "./constants";
import { writeSliceFile, WriteSliceFileArgs } from "./writeSliceFile";

export type WriteSliceModelArgs = Pick<
	WriteSliceFileArgs,
	"libraryID" | "sliceID" | "format" | "helpers" | "actions"
> & {
	model: SharedSlice;
};

/**
 * Writes a Slice model to the file system in the Slice's Slice library.
 *
 * @returns The file path to the written model.
 */
export async function writeSliceModel(
	args: WriteSliceModelArgs,
): Promise<string> {
	return await writeSliceFile({
		filename: MODEL_FILENAME,
		contents: JSON.stringify(args.model, null, 2),
		format: args.format,
		libraryID: args.libraryID,
		sliceID: args.sliceID,
		actions: args.actions,
		helpers: args.helpers,
	});
}
