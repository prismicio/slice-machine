import {
	buildCustomTypeFilePath,
	BuildCustomTypeFilePathArgs,
} from "./buildCustomTypeFilePath";
import { readProjectFile, ReadProjectFileArgs } from "./readProjectFile";
import { BufferEncoding } from "./types";

export type ReadCustomTypeFileArgs = BuildCustomTypeFilePathArgs &
	ReadProjectFileArgs;

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

	return await readProjectFile({
		filename: filePath,
		encoding: args.encoding as BufferEncoding,
		helpers: args.helpers,
	});
}
