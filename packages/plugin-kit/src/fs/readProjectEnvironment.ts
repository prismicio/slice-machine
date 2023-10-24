import * as dotenv from "dotenv";

import {
	checkHasProjectFile,
	CheckHasProjectFileArgs,
} from "./checkHasProjectFile";

import { readProjectFile, ReadProjectFileArgs } from "./readProjectFile";

export type ReadProjectEnvironmentArgs = {
	filenames: string[];
	variableName: string;
} & Omit<CheckHasProjectFileArgs, "filename"> &
	Omit<ReadProjectFileArgs, "filename">;

export type ReadEnvironmentReturnType = {
	environment: string | undefined;
};

export const readProjectEnvironment = async (
	args: ReadProjectEnvironmentArgs,
): Promise<ReadEnvironmentReturnType> => {
	let vars: Partial<Record<string, string>> = {};

	for (const filename of args.filenames) {
		const hasProjectFile = await checkHasProjectFile({
			filename,
			helpers: args.helpers,
		});

		if (!hasProjectFile) {
			continue;
		}

		const contents = await readProjectFile({
			filename,
			helpers: args.helpers,
		});

		vars = {
			...vars,
			...dotenv.parse(contents),
		};
	}

	return {
		environment: vars[args.variableName],
	};
};
