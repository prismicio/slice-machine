import { PluginSystemHelpers } from "../createPluginSystemHelpers";

import * as fs from "./lib/fsLimit";

type BufferEncoding = Extract<Parameters<typeof fs.readFile>[1], string>;

export type ReadProjectFileArgs = {
	filename: string;
	helpers: PluginSystemHelpers;
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

	return await fs.readFile(filePath, args.encoding);
}
