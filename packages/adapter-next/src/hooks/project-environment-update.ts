import type { ProjectEnvironmentUpdateHook } from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	readProjectFile,
	writeProjectFile,
} from "@slicemachine/plugin-kit/fs";

import type { PluginOptions } from "../types";
import {
	DEFAULT_ENVIRONMENT_VARIABLE_FILE_PATH,
	PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME,
} from "../constants";

type BuildVariableLineArgs = {
	environment: string;
};

const buildVariableLine = (args: BuildVariableLineArgs): string => {
	return `${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME}=${args.environment}`;
};

type AppendEnvironmentVariableArgs = {
	contents: string;
	environment: string;
};

const appendEnvironmentVariable = (
	args: AppendEnvironmentVariableArgs,
): string => {
	let res = args.contents.toString();

	if (!res.endsWith("\n")) {
		res += "\n";
	}

	res += buildVariableLine({ environment: args.environment }) + "\n";

	return res;
};

type UpdateEnvironmentVariableArgs = {
	contents: string;
	environment: string;
};

const updateEnvironmentVariable = (
	args: UpdateEnvironmentVariableArgs,
): string => {
	return args.contents.replace(
		new RegExp(`^${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME}=.*$\n?`),
		`${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME}=${args.environment}`,
	);
};

type RemoveEnvironmentVariableArgs = {
	contents: string;
};

const removeEnvironmentVariable = (
	args: RemoveEnvironmentVariableArgs,
): string => {
	return args.contents.replace(
		new RegExp(`^${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME}=.*$\n?`),
		"",
	);
};

export const projectEnvironmentUpdate: ProjectEnvironmentUpdateHook<
	PluginOptions
> = async ({ environment }, { options, helpers }) => {
	const environmentVariableFilePath =
		options.environmentVariableFilePath ||
		DEFAULT_ENVIRONMENT_VARIABLE_FILE_PATH;

	const variableRegExp = new RegExp(
		`^${PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME}=.*$`,
		"m",
	);

	const hasEnvironmentVariableFile = await checkHasProjectFile({
		filename: environmentVariableFilePath,
		helpers,
	});

	let contents;

	if (hasEnvironmentVariableFile) {
		const existingContents = await readProjectFile({
			filename: environmentVariableFilePath,
			helpers,
			encoding: "utf8",
		});

		const hasExistingVariable = variableRegExp.test(existingContents);

		if (environment === undefined) {
			contents = removeEnvironmentVariable({ contents: existingContents });
		} else if (hasExistingVariable) {
			contents = updateEnvironmentVariable({
				contents: existingContents,
				environment,
			});
		} else {
			contents = appendEnvironmentVariable({
				contents: existingContents,
				environment,
			});
		}
	} else {
		if (environment === undefined) {
			// noop

			return;
		}

		contents = appendEnvironmentVariable({ contents: "", environment });
	}

	await writeProjectFile({
		filename: environmentVariableFilePath,
		contents: contents,
		helpers,
	});
};
