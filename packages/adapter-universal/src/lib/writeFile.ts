import { SliceMachineHelpers } from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export type WriteFileArgs = {
	filePath: string;
	contents: string;
	format?: boolean;
	helpers: SliceMachineHelpers;
};

/**
 * Writes a file with optional formatting.
 *
 * @returns The file path to the written file.
 */
export async function writeFile(args: WriteFileArgs): Promise<string> {
	const filePath = args.helpers.joinPathFromRoot(args.filePath);

	let contents = args.contents;

	if (args.format) {
		contents = await args.helpers.format(contents, filePath);
	}

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, contents);

	return filePath;
}
