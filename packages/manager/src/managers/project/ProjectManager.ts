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
import { format } from "../../lib/format";

type ProjectManagerGetSliceMachineConfigPathArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerGetRootArgs = {
	ignoreCache?: boolean;
};

type ProjectManagerCheckIsTypeScriptArgs = {
	rootOverride?: string;
};

type ProjectManagerWriteSliceMachineConfigArgs = {
	config: SliceMachineConfig;
	path?: string;
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

	async suggestRoot(): Promise<string> {
		const suggestedRootPackageJSON = await locateFileUpward("package.json", {
			startDir: this.cwd,
		});

		return path.dirname(suggestedRootPackageJSON);
	}

	async suggestSliceMachineConfigPath(): Promise<string> {
		const suggestedRoot = await this.suggestRoot();

		return path.resolve(suggestedRoot, SLICE_MACHINE_CONFIG_FILENAME);
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

	async writeSliceMachineConfig(
		args: ProjectManagerWriteSliceMachineConfigArgs,
	): Promise<void> {
		const configFilePath =
			args.path || (await this.getSliceMachineConfigPath());

		const config = await format(
			JSON.stringify(args.config, null, 2),
			configFilePath,
		);

		await fs.writeFile(configFilePath, config, "utf-8");
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

	async getRunningSliceMachineVersion(): Promise<string> {
		const sliceMachineDir = await this.locateSliceMachineUIDir();

		const sliceMachinePackageJSONContents = await fs.readFile(
			path.join(sliceMachineDir, "package.json"),
			"utf8",
		);

		// TODO: Validate the contents? This code currently assumes a
		// well-formed document.
		const json = JSON.parse(sliceMachinePackageJSONContents);

		return json.version;
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
