import * as fs from "node:fs/promises";
import * as path from "node:path";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";

export type WriteProjectFileArgs = {
	filename: string;
	contents: Parameters<typeof fs.writeFile>[1];
	format?: boolean;
	formatOptions?: Parameters<SliceMachineHelpers["format"]>[2];
	helpers: SliceMachineHelpers;
};

/**
 * Writes a file to the project with optional formatting.
 *
 * @returns The file path to the written file.
 */
export const writeProjectFile = async (
	args: WriteProjectFileArgs,
): Promise<string> => {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	let contents = args.contents;

	if (args.format) {
		contents = await args.helpers.format(
			contents.toString(),
			filePath,
			args.formatOptions,
		);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);

	return filePath;
};
