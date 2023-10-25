import * as fs from "node:fs/promises";

import { SliceMachineHelpers } from "../createSliceMachineHelpers";
import { fsLimit } from "./lib/fsLimit";

type BufferEncoding = Extract<Parameters<typeof fs.readFile>[1], string>;

export type ReadProjectFileArgs = {
	filename: string;
	helpers: SliceMachineHelpers;
};

export async function readProjectFile(
	args: ReadProjectFileArgs,
): Promise<Buffer>;
export async function readProjectFile(
	args: ReadProjectFileArgs & { encoding: BufferEncoding },
): Promise<string>;
export async function readProjectFile(
	args: ReadProjectFileArgs & { encoding?: BufferEncoding },
): Promise<Buffer | string> {
	const filePath = args.helpers.joinPathFromRoot(args.filename);

	return await fsLimit(() => fs.readFile(filePath, args.encoding));
}
