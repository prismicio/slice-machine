import {
	SliceMachineActions,
	SliceMachineHelpers,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildSliceFilePath } from "./buildSliceFilePath";

export type WriteSliceFileArgs = {
	libraryID: string;
	sliceID: string;
	filename: string;
	contents: string;
	format?: boolean;
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
};

/**
 * Writes a Slice model to the file system in the Slice's Slice library.
 *
 * @returns The file path to the written file.
 */
export async function writeSliceFile(
	args: WriteSliceFileArgs,
): Promise<string> {
	const filePath = await buildSliceFilePath({
		libraryID: args.libraryID,
		sliceID: args.sliceID,
		helpers: args.helpers,
		filename: args.filename,
		actions: args.actions,
	});

	let contents = args.contents;

	if (args.format) {
		contents = await args.helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);

	return filePath;
}
