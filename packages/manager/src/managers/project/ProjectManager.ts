import * as fs from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { createRequire } from "node:module";

import { decodeSliceMachineConfig } from "../../lib/decodeSliceMachineConfig";
import { locateFileUpward } from "../../lib/locateFileUpward";

import { SliceMachineConfig } from "../../types";

import { SLICE_MACHINE_CONFIG_FILENAME } from "../../constants/SLICE_MACHINE_CONFIG_FILENAME";
import { TS_CONFIG_FILENAME } from "../../constants/TS_CONFIG_FILENAME";
import { SLICE_MACHINE_NPM_PACKAGE_NAME } from "../../constants/SLICE_MACHINE_NPM_PACKAGE_NAME";

import { BaseManager } from "../BaseManager";

type ProjectManagerGetSliceMachineConfigPathArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerGetRootArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerCheckIsTypeScriptArgs = {
	rootOverride?: string;
};

type ProjectManagerUpdateSliceMachineConfigArgs = {
	searchAndReplaceMap: Record<string, string | RegExp>;
};

export class ProjectManager extends BaseManager {
	private _cachedRoot: string | undefined;
	private _cachedSliceMachineConfigPath: string | undefined;
	private _cachedSliceMachineConfig: SliceMachineConfig | undefined;

	async getSliceMachineConfigPath(
		args?: ProjectManagerGetSliceMachineConfigPathArgs,
	): Promise<string> {
		if (this._cachedSliceMachineConfigPath && !args?.ignoreCache) {
			return this._cachedSliceMachineConfigPath;
		}

		try {
			this._cachedSliceMachineConfigPath = await locateFileUpward(
				SLICE_MACHINE_CONFIG_FILENAME,
				{ startDir: this.cwd },
			);
		} catch (error) {
			throw new Error(
				`Could not find a ${SLICE_MACHINE_CONFIG_FILENAME} file. Please create a config file at the root of your project.`,
			);
		}

		return this._cachedSliceMachineConfigPath;
	}

	async getRoot(args?: ProjectManagerGetRootArgs): Promise<string> {
		if (this._cachedRoot && !args?.ignoreCache) {
			return this._cachedRoot;
		}

		const sliceMachineConfigFilePath = await this.getSliceMachineConfigPath({
			ignoreCache: args?.ignoreCache,
		});

		this._cachedRoot = path.dirname(sliceMachineConfigFilePath);

		return this._cachedRoot;
	}

	async suggestSliceMachineConfigPath(): Promise<string> {
		const possibleRootPackageJSON = await locateFileUpward("package.json", {
			startDir: this.cwd,
		});
		const possibleRoot = path.dirname(possibleRootPackageJSON);

		return path.resolve(possibleRoot, SLICE_MACHINE_CONFIG_FILENAME);
	}

	async checkIsTypeScript(
		args?: ProjectManagerCheckIsTypeScriptArgs,
	): Promise<boolean> {
		const root = args?.rootOverride || (await this.getRoot());
		const rootTSConfigPath = path.resolve(root, TS_CONFIG_FILENAME);

		// We just care if the file exists, we don't need access to it
		return existsSync(rootTSConfigPath);
	}

	async getSliceMachineConfig(): Promise<SliceMachineConfig> {
		if (this._cachedSliceMachineConfig) {
			return this._cachedSliceMachineConfig;
		} else {
			return await this.loadSliceMachineConfig();
		}
	}

	// TODO: This is a temporary strategy for upading Slice Machine
	// configuration based on string search & replace, e.g.
	// `this.updateSliceMachineConfig({ "200629-sms-hoy":
	// /__PRISMIC_REPOSITORY_NAME/g })` replaces all occurence of
	// "__PRISMIC_REPOSITORY_NAME" with "200629-sms-hoy". We'll need
	// something stronger/more convenient for starters.
	//
	// TOOD: Replace this method with something that programmatically
	// updates `slicemachine.config.json`. Since it is now a JSON file, we
	// can update values programmatically rather than with search and
	// replace.
	async updateSliceMachineConfig(
		args: ProjectManagerUpdateSliceMachineConfigArgs,
	): Promise<void> {
		const configFilePath = await this.getSliceMachineConfigPath();

		let rawConfig = await fs.readFile(configFilePath, "utf-8");

		for (const replacement in args.searchAndReplaceMap) {
			const searchPattern = args.searchAndReplaceMap[replacement];

			rawConfig = rawConfig.replace(searchPattern, replacement);
		}

		await fs.writeFile(configFilePath, rawConfig);
		delete this._cachedSliceMachineConfig; // Clear config cache
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		// TODO: Reload plugins with a fresh plugin runner. Plugins may
		// have been added or removed.

		const configFilePath = await this.getSliceMachineConfigPath();

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

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._cachedSliceMachineConfig = sliceMachineConfig;

		return sliceMachineConfig;
	}

	async locateSliceMachineUIDir(): Promise<string> {
		const projectRoot = await this.getRoot();

		const require = createRequire(path.join(projectRoot, "index.js"));
		const sliceMachinePackageJSONPath = require.resolve(
			`${SLICE_MACHINE_NPM_PACKAGE_NAME}/package.json`,
		);

		return path.dirname(sliceMachinePackageJSONPath);
	}
}
