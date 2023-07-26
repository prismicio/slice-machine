import {
	buildSliceFilePath,
	BuildSliceFilePathArgs,
} from "./buildSliceFilePath";
import { readProjectFile, ReadProjectFileArgs } from "./readProjectFile";
import { BufferEncoding } from "./types";

export type ReadSliceFileArgs = BuildSliceFilePathArgs & ReadProjectFileArgs;

export async function readSliceFile(args: ReadSliceFileArgs): Promise<Buffer>;
export async function readSliceFile(
	args: ReadSliceFileArgs & { encoding: BufferEncoding },
): Promise<string>;
export async function readSliceFile(
	args: ReadSliceFileArgs & { encoding?: BufferEncoding },
): Promise<Buffer | string> {
	const filePath = await buildSliceFilePath({
		...args,
		absolute: false,
	});

	return await readProjectFile({
		filename: filePath,
		encoding: args.encoding as BufferEncoding,
		helpers: args.helpers,
	});
}
