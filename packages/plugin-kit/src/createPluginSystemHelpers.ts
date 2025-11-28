import * as path from "node:path";
import * as fs from "node:fs/promises";

import * as prettier from "prettier";
import { stripIndent } from "common-tags";

import { decodePrismicConfig } from "./lib/decodePrismicConfig";

import { PrismicConfig, PrismicProject } from "./types";

type UpdatePrismicConfigOptions = {
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
 * Creates Plugin System helpers.
 *
 * @internal
 */
export const createPluginSystemHelpers = (
	project: PrismicProject,
): PluginSystemHelpers => {
	return new PluginSystemHelpers(project);
};

/**
 * Plugin System helpers shared to plugins and hooks.
 */
export class PluginSystemHelpers {
	/**
	 * Project's metadata.
	 *
	 * @internal
	 */
	private _project: PrismicProject;

	constructor(project: PrismicProject) {
		this._project = project;
	}

	getProject = async (): Promise<PrismicProject> => {
		const configFilePath = this.joinPathFromRoot("prismic.config.json");

		let rawConfig: unknown | undefined;
		try {
			const contents = await fs.readFile(configFilePath, "utf8");
			rawConfig = JSON.parse(contents);
		} catch {
			// noop
		}

		if (!rawConfig) {
			throw new Error(
				"No Prismic config found, please initialize your project with first.",
			);
		}

		const { value: prismicConfig, error } = decodePrismicConfig(rawConfig);

		if (error) {
			throw new Error(`Invalid Prismic config. ${error.errors.join(", ")}`);
		}

		return {
			...this._project,
			config: prismicConfig,
		};
	};

	updatePrismicConfig = async (
		prismicConfig: PrismicConfig,
		options?: UpdatePrismicConfigOptions,
	): Promise<void> => {
		const { value: decodedPrismicConfig, error } =
			decodePrismicConfig(prismicConfig);

		if (error) {
			throw new Error(
				`Invalid Prismic config provided. ${error.errors.join(", ")}`,
			);
		}

		const configFilePath = this.joinPathFromRoot("prismic.config.json");
		let content = JSON.stringify(decodedPrismicConfig, null, 2);

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

		formatted = await prettier.format(formatted, {
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
