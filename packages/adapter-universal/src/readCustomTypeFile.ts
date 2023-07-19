import * as fs from "node:fs/promises";

import {
	buildCustomTypeFilePath,
	BuildCustomTypeFilePathArgs,
} from "./buildCustomTypeFilePath";

type BufferEncoding = Extract<Parameters<typeof fs.readFile>[1], string>;

export type ReadCustomTypeFileArgs = BuildCustomTypeFilePathArgs;

export async function readCustomTypeFile(
	args: ReadCustomTypeFileArgs,
): Promise<Buffer>;
export async function readCustomTypeFile(
	args: ReadCustomTypeFileArgs & { encoding: BufferEncoding },
): Promise<string>;
export async function readCustomTypeFile(
	args: ReadCustomTypeFileArgs & { encoding?: BufferEncoding },
): Promise<Buffer | string> {
	const filePath = buildCustomTypeFilePath(args);

	return await fs.readFile(filePath, args.encoding);
}
