import type { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { CUSTOM_TYPE_MODEL_FILENAME } from "./constants";
import {
	writeCustomTypeFile,
	WriteCustomTypeFileArgs,
} from "./writeCustomTypeFile";

export type WriteCustomTypeModelArgs = Omit<
	WriteCustomTypeFileArgs,
	"customTypeID" | "filename" | "contents"
> & {
	model: CustomType;
};

/**
 * Writes a CustomType model to the file system in the CustomType's CustomType
 * library.
 *
 * @returns The file path to the written model.
 */
export const writeCustomTypeModel = async (
	args: WriteCustomTypeModelArgs,
): Promise<string> => {
	return await writeCustomTypeFile({
		...args,
		customTypeID: args.model.id,
		filename: CUSTOM_TYPE_MODEL_FILENAME,
		contents: JSON.stringify(args.model, null, 2),
	});
};
