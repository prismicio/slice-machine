import type { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { MODEL_FILENAME } from "./constants";
import {
	writeCustomTypeFile,
	WriteCustomTypeFileArgs,
} from "./writeCustomTypeFile";

export type WriteCustomTypeModelArgs = Pick<
	WriteCustomTypeFileArgs,
	"customTypeID" | "format" | "helpers" | "actions"
> & {
	model: SharedSlice;
};

/**
 * Writes a CustomType model to the file system in the CustomType's CustomType
 * library.
 *
 * @returns The file path to the written model.
 */
export async function writeCustomTypeModel(
	args: WriteCustomTypeModelArgs,
): Promise<string> {
	return await writeCustomTypeFile({
		filename: MODEL_FILENAME,
		contents: JSON.stringify(args.model, null, 2),
		format: args.format,
		customTypeID: args.customTypeID,
		actions: args.actions,
		helpers: args.helpers,
	});
}
