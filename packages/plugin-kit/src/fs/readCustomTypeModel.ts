import { CustomType } from "@prismicio/types-internal/lib/customtypes";

import { CUSTOM_TYPE_MODEL_FILENAME } from "./constants";
import {
	readCustomTypeFile,
	ReadCustomTypeFileArgs,
} from "./readCustomTypeFile";

export type ReadCustomTypeModelArgs = Omit<ReadCustomTypeFileArgs, "filename">;

export type ReadCustomTypeModelReturnType = {
	model: CustomType;
};

export const readCustomTypeModel = async (
	args: ReadCustomTypeModelArgs,
): Promise<ReadCustomTypeModelReturnType> => {
	const model = await readCustomTypeFile({
		...args,
		filename: CUSTOM_TYPE_MODEL_FILENAME,
		encoding: "utf8",
	});

	return {
		model: JSON.parse(model),
	};
};
