import {
	SliceMachineActions,
	SliceMachineHelpers,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildCustomTypeFilePath } from "./buildCustomTypeFilePath";

export type WriteCustomTypeFileArgs = {
	customTypeID: string;
	filename: string;
	contents: string;
	format?: boolean;
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
};

/**
 * Writes a CustomType model to the file system in the CustomType's CustomType
 * library.
 *
 * @returns The file path to the written file.
 */
export async function writeCustomTypeFile(
	args: WriteCustomTypeFileArgs,
): Promise<string> {
	const filePath = buildCustomTypeFilePath({
		customTypeID: args.customTypeID,
		helpers: args.helpers,
		filename: args.filename,
	});

	let contents = args.contents;

	if (args.format) {
		contents = await args.helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);

	return filePath;
}
