import * as dotenv from "dotenv";

import {
	checkHasProjectFile,
	CheckHasProjectFileArgs,
} from "./checkHasProjectFile";
import { readProjectFile, ReadProjectFileArgs } from "./readProjectFile";
import { writeProjectFile, WriteProjectFileArgs } from "./writeProjectFile";

export type WriteProjectEnvironmentArgs = {
	variableName: string;
	environment: string | undefined;
} & Omit<CheckHasProjectFileArgs, "filename"> &
	Omit<ReadProjectFileArgs, "filename"> &
	Omit<WriteProjectFileArgs, "contents" | "format" | "formatOptions">;

export const writeProjectEnvironment = async (
	args: WriteProjectEnvironmentArgs,
): Promise<string | undefined> => {
	const hasEnvironmentVariableFile = await checkHasProjectFile({
		filename: args.filename,
		helpers: args.helpers,
	});

	if (!hasEnvironmentVariableFile && args.environment === undefined) {
		return;
	}

	let contents = hasEnvironmentVariableFile
		? await readProjectFile({
				filename: args.filename,
				helpers: args.helpers,
				encoding: "utf8",
		  })
		: "";

	const variableLine = `${args.variableName}=${args.environment}\n`;

	const hasExistingVariable = args.variableName in dotenv.parse(contents);

	if (hasExistingVariable) {
		// TODO: This regexp/replace is not working.
		contents = contents.replace(
			new RegExp(`^${args.variableName}=.*\n?$`, "m"),
			args.environment === undefined ? "" : variableLine,
		);
	} else {
		if (!contents.endsWith("\n")) {
			contents += "\n";
		}

		contents += variableLine;
	}

	await writeProjectFile({
		filename: args.filename,
		contents,
		format: false,
		helpers: args.helpers,
	});

	return args.filename;
};
