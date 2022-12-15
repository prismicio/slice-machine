import * as path from "node:path";
import * as fs from "node:fs/promises";

import prettier from "prettier";
import { stripIndent } from "common-tags";

import { SliceMachineProject } from "./types";

type FormatOptions = {
	prettier?: prettier.Options;
	/**
	 * Determines if a newline is included at the end of the formatted result.
	 *
	 * @defaultValue `true`
	 */
	includeNewlineAtEnd?: boolean;
};

/**
 * Creates Slice Machine helpers.
 *
 * @internal
 */
export const createSliceMachineHelpers = (
	project: SliceMachineProject,
): SliceMachineHelpers => {
	return new SliceMachineHelpers(project);
};

/**
 * Slice Machine helpers shared to plugins and hooks.
 */
export class SliceMachineHelpers {
	/**
	 * The Slice Machine project's metadata.
	 *
	 * @internal
	 */
	private _project: SliceMachineProject;

	constructor(project: SliceMachineProject) {
		this._project = project;
	}

	getProject = async (): Promise<SliceMachineProject> => {
		const configFilePath = this.joinPathFromRoot("sm.json");
		const configContents = await fs.readFile(configFilePath, "utf8");
		const config = JSON.parse(configContents);

		return {
			...this._project,
			config,
		};
	};

	format = async (
		source: string,
		filePath?: string,
		options?: FormatOptions,
	): Promise<string> => {
		let formatted = stripIndent(source);

		const prettierOptions = await prettier.resolveConfig(
			filePath || this._project.root,
		);

		formatted = prettier.format(formatted, {
			...prettierOptions,
			filepath: filePath,
			...(options?.prettier ?? {}),
		});

		if (options?.includeNewlineAtEnd === false) {
			formatted = formatted.replace(/[\r\n]+$/, "");
		}

		return formatted;
	};

	joinPathFromRoot = (...paths: string[]): string => {
		return path.join(this._project.root, ...paths);
	};
}
