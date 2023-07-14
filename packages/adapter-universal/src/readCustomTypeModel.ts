import { CustomType } from "@prismicio/types-internal/lib/customtypes";
import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as path from "node:path";
import { buildCustomTypeDirectoryPath } from "./buildCustomTypeDirectoryPath";
import { readJSONFile } from "./lib/readJSONFile";

export type ReadCustomTypeModelArgs = {
	id: string;
	helpers: SliceMachineHelpers;
};

export type ReadCustomTypeModelReturnType = {
	model: CustomType;
};

export async function readCustomTypeModel(
	args: ReadCustomTypeModelArgs,
): Promise<ReadCustomTypeModelReturnType> {
	const filePath = path.join(
		buildCustomTypeDirectoryPath({
			customTypeID: args.id,
			helpers: args.helpers,
		}),
		"index.json",
	);

	const model = await readJSONFile<CustomType>(filePath);

	return {
		model,
	};
}
