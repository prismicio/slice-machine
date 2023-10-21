import type { ProjectEnvironmentReadHook } from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	readProjectFile,
} from "@slicemachine/plugin-kit/fs";
import * as dotenv from "dotenv";

import type { PluginOptions } from "../types";
import {
	DEFAULT_ENVIRONMENT_VARIABLE_FILE_PATH,
	PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME,
} from "../constants";

export const projectEnvironmentRead: ProjectEnvironmentReadHook<
	PluginOptions
> = async (_data, { options, helpers }) => {
	const environmentVariableFilePath =
		options.environmentVariableFilePath ||
		DEFAULT_ENVIRONMENT_VARIABLE_FILE_PATH;

	const hasEnvironmentVariableFile = await checkHasProjectFile({
		filename: environmentVariableFilePath,
		helpers,
	});

	if (!hasEnvironmentVariableFile) {
		return {
			environment: undefined,
		};
	}

	const contents = await readProjectFile({
		filename: environmentVariableFilePath,
		helpers,
	});

	const vars = dotenv.parse(contents);

	const environment = vars[PRISMIC_ENVIRONMENT_ENVIRONMENT_VARIABLE_NAME];

	if (environment) {
		return {
			environment,
		};
	}

	return {
		environment: undefined,
	};
};
