import * as path from "node:path";
import * as fs from "node:fs/promises";

import prettier from "prettier";
import { stripIndent } from "common-tags";

import { decodeSliceMachineConfig } from "./lib/decodeSliceMachineConfig";

import { SliceMachineConfig, SliceMachineProject } from "./types";

type UpdateSliceMachineConfigOptions = {
	format?: boolean;
};

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
		const configFilePath = this.joinPathFromRoot("slicemachine.config.json");

		let rawConfig: unknown | undefined;
		try {
			const contents = await fs.readFile(configFilePath, "utf8");
			rawConfig = JSON.parse(contents);
		} catch {
			// noop
		}

		if (!rawConfig) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value: sliceMachineConfig, error } =
			decodeSliceMachineConfig(rawConfig);

		if (error) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${error.errors.join(", ")}`);
		}

		return {
			...this._project,
			config: sliceMachineConfig,
		};
	};

	updateSliceMachineConfig = async (
		sliceMachineConfig: SliceMachineConfig,
		options?: UpdateSliceMachineConfigOptions,
	): Promise<void> => {
		const { value: decodedSliceMachineConfig, error } =
			decodeSliceMachineConfig(sliceMachineConfig);

		if (error) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config provided. ${error.errors.join(", ")}`);
		}

		const configFilePath = this.joinPathFromRoot("slicemachine.config.json");
		let content = JSON.stringify(decodedSliceMachineConfig, null, 2);

		if (options?.format) {
			content = await this.format(content, configFilePath);
		}

		await fs.writeFile(configFilePath, content);
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
