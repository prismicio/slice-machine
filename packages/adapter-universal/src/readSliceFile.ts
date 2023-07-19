import * as fs from "node:fs/promises";

import {
	buildSliceFilePath,
	BuildSliceFilePathArgs,
} from "./buildSliceFilePath";

type BufferEncoding = Extract<Parameters<typeof fs.readFile>[1], string>;

export type ReadSliceFileArgs = BuildSliceFilePathArgs;

export async function readSliceFile(args: ReadSliceFileArgs): Promise<Buffer>;
export async function readSliceFile(
	args: ReadSliceFileArgs & { encoding: BufferEncoding },
): Promise<string>;
export async function readSliceFile(
	args: ReadSliceFileArgs & { encoding?: BufferEncoding },
): Promise<Buffer | string> {
	const filePath = await buildSliceFilePath(args);

	return await fs.readFile(filePath, args.encoding);
}
