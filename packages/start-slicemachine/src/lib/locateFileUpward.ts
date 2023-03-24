import * as path from "node:path";
import * as fs from "node:fs/promises";

import { castArray } from "./castArray";

type LocateFileUpwardConfig = {
	startDir?: string;
	stopDir?: string;
	/**
	 * @internal
	 */
	_originalStartDir?: string;
};

// TODO: MIGRATION - Remove this after migration the Migration Manager if still not used elsewhere
export const locateFileUpward = async (
	filePathOrPaths: string | readonly string[],
	{
		startDir = process.cwd(),
		stopDir = path.resolve(startDir, "/"),
		_originalStartDir,
	}: LocateFileUpwardConfig = {},
): Promise<string> => {
	const originalStartDir = _originalStartDir ?? startDir;

	const filePaths = castArray(filePathOrPaths);

	for (const filePath of filePaths) {
		const resolvedFilePath = path.resolve(startDir, filePath);
		try {
			await fs.access(resolvedFilePath);

			return resolvedFilePath;
		} catch {
			continue;
		}
	}

	if (startDir === stopDir) {
		const formattedFilePaths = filePaths
			.map((filePath) => "`" + filePath + "`")
			.join(" or ");

		throw new Error(
			`Could not locate ${formattedFilePaths} between \`${originalStartDir}\` and \`${stopDir}\`.`,
		);
	}

	return locateFileUpward(filePathOrPaths, {
		startDir: path.resolve(startDir, ".."),
		stopDir,
		_originalStartDir: originalStartDir,
	});
};
