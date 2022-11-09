import * as path from "node:path";
import * as fs from "node:fs/promises";

const castArray = <T>(input: T | readonly T[]): T[] => {
	return Array.isArray(input) ? input : ([input] as T[]);
};

type LocateFileUpwardConfig = {
	startDir?: string;
	stopDir?: string;
};

export const locateFileUpward = async (
	filePathOrPaths: string | readonly string[],
	{ startDir = process.cwd(), stopDir = "/" }: LocateFileUpwardConfig = {},
): Promise<string> => {
	const filePaths = castArray(filePathOrPaths);

	try {
		for (const filePath of filePaths) {
			const resolvedFilePath = path.resolve(startDir, filePath);

			try {
				await fs.access(resolvedFilePath);

				return resolvedFilePath;
			} catch {
				continue;
			}
		}
	} catch {
		// noop
	}

	if (startDir === stopDir) {
		throw new Error(
			`Could not locate \`${filePathOrPaths}\` between \`${startDir}\` and \`${stopDir}\`.`,
		);
	}

	return locateFileUpward(filePathOrPaths, {
		startDir: path.resolve(startDir, ".."),
		stopDir,
	});
};
