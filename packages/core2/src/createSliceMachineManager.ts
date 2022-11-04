import { CustomTypeModel, SharedSliceModel } from "@prismicio/types";
import {
	CallHookReturnType,
	CustomTypeCreateHook,
	CustomTypeCreateHookData,
	CustomTypeDeleteHook,
	CustomTypeDeleteHookData,
	CustomTypeLibraryReadHookData,
	CustomTypeReadHookData,
	CustomTypeUpdateHook,
	CustomTypeUpdateHookData,
	HookError,
	SliceAssetUpdateHook,
	SliceCreateHook,
	SliceCreateHookData,
	SliceDeleteHook,
	SliceDeleteHookData,
	SliceLibraryReadHookData,
	SliceMachinePluginRunner,
	SliceReadHookData,
	SliceUpdateHook,
	SliceUpdateHookData,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { captureSliceSimulatorScreenshot } from "./lib/captureSliceSimulatorScreenshot";

import { decode } from "./lib/decode";
import { loadModuleWithJiti } from "./lib/loadModuleWithJiti";

import { SliceMachineConfig } from "./types";

declare const createSliceMachinePluginRunner: (args: {
	projectConfig: SliceMachineConfig;
}) => SliceMachinePluginRunner;

function assertPluginsInitialized(
	pluginRunner: SliceMachinePluginRunner | undefined,
): asserts pluginRunner is NonNullable<typeof pluginRunner> {
	if (pluginRunner == undefined) {
		throw new Error(
			"Plugins have not yet been initialized. Run `SliceMachineManager.prototype.initPlugins()` before re-calling this method.",
		);
	}
}

type OnlyHookErrors<
	THookResult extends
		| { errors: HookError[] }
		| Promise<{ errors: HookError[] }>,
> = Pick<Awaited<THookResult>, "errors">;

// // TODO: Understand why `Pick` must be used directly in the return type rather
// // than using `OnlyHookErrors`.
// const onlyHookErrors = <THookResult extends { errors: HookError[] }>(
// 	hookResult: THookResult,
// ): Pick<Awaited<THookResult>, "errors"> => {
// 	return { errors: hookResult.errors };
// };

// type UseFirstHookDataElement<THookFn extends HookFn> = Omit<
// 	Awaited<CallHookReturnType<THookFn>>,
// 	"data"
// > & {
// 	data: Awaited<CallHookReturnType<THookFn>>["data"] | undefined;
// };
//
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// const useFirstHookDataElement = <THookValue extends { data: any[] }>(
// 	hookResult: THookValue,
// ): Omit<THookValue, "data"> & { data: THookValue["data"][number] } => {
// 	return {
// 		...hookResult,
// 		data: hookResult.data[0],
// 	};
// };

export const createSliceMachineManager = (): SliceMachineManager => {
	return new SliceMachineManager();
};

type SliceMachineManagerPushSliceArgs = {
	libraryID: string;
	sliceID: string;
};

type SliceMachineManagerReadSliceLibraryReturnType = {
	sliceIDs: string[] | undefined;
	errors: HookError[];
};

type SliceMachineManagerReadSliceReturnType = {
	model: SharedSliceModel | undefined;
	errors: HookError[];
};

type SliceMachineManagerUpdateSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
	data: Buffer;
};

type SliceMachineManagerCaptureSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type SliceMachineManagerCaptureSliceScreenshotReturnType = {
	data: Buffer;
};

type SliceMachineManagerReadSliceScreenshotArgs = {
	libraryID: string;
	sliceID: string;
	variationID: string;
};

type SliceMachineManagerReadSliceScreenshotReturnType = {
	data: Buffer | undefined;
	errors: HookError[];
};

type SliceMachineManagerReadCustomTypeLibraryReturnType = {
	ids: string[] | undefined;
	errors: HookError[];
};

type SliceMachineManagerReadCustomTypeReturnType = {
	model: CustomTypeModel | undefined;
	errors: HookError[];
};

type SliceMachineManagerPushCustomTypeArgs = {
	id: string;
};

export class SliceMachineManager {
	private _pluginRunner: SliceMachinePluginRunner | undefined;
	private _projectConfig: SliceMachineConfig | undefined;

	async getProjectConfig(): Promise<SliceMachineConfig> {
		if (this._projectConfig) {
			return this._projectConfig;
		} else {
			return await this.loadProjectConfig();
		}
	}

	async loadProjectConfig(): Promise<SliceMachineConfig> {
		let config: SliceMachineConfig | undefined;

		for (const configPath of [
			"slicemachine.config.ts",
			"slicemachine.config.js",
		]) {
			try {
				await fs.access(configPath);
				config = loadModuleWithJiti(path.resolve(configPath));
			} catch {
				// noop
			}
		}

		if (!config) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value, errors } = decode(SliceMachineConfig, config);

		if (errors) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${errors}`);
		}

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._projectConfig = value;

		return value;
	}

	async setProjectConfig(projectConfig: SliceMachineConfig): Promise<void> {
		this._projectConfig = projectConfig;
	}

	async initPlugins(): Promise<void> {
		const projectConfig = await this.getProjectConfig();

		this._pluginRunner = createSliceMachinePluginRunner({ projectConfig });

		await this._pluginRunner.init();
	}

	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SliceMachineManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"slice-library:read",
			args,
		);

		return {
			sliceIDs: hookResult.data[0]?.sliceIDs,
			errors: hookResult.errors,
		};
	}

	async createSlice(
		args: SliceCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceCreateHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:create", args);

		return {
			errors: hookResult.errors,
		};
	}

	async readSlice(
		args: SliceReadHookData,
	): Promise<SliceMachineManagerReadSliceReturnType> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:read", args);

		return {
			model: hookResult.data[0]?.model,
			errors: hookResult.errors,
		};
	}

	async updateSlice(
		args: SliceUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceUpdateHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:update", args);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Disallow until Slices can be deleted.
	async deleteSlice(
		args: SliceDeleteHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceDeleteHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:delete", args);

		return {
			errors: hookResult.errors,
		};
	}

	async pushSlice(_args: SliceMachineManagerPushSliceArgs): Promise<void> {
		assertPluginsInitialized(this._pluginRunner);

		// TODO: Push Slice to Prismic.
	}

	async readSliceScreenshot(
		args: SliceMachineManagerReadSliceScreenshotArgs,
	): Promise<SliceMachineManagerReadSliceScreenshotReturnType> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:asset:read", {
			libraryID: args.libraryID,
			sliceID: args.sliceID,
			assetID: `screenshot-${args.variationID}`,
		});

		return {
			data: hookResult.data[0]?.data,
			errors: hookResult.errors,
		};
	}

	async updateSliceScreenshot(
		args: SliceMachineManagerUpdateSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook("slice:asset:update", {
			libraryID: args.libraryID,
			sliceID: args.sliceID,
			asset: {
				id: `screenshot-${args.variationID}`,
				data: args.data,
			},
		});

		return {
			errors: hookResult.errors,
		};
	}

	async captureSliceScreenshot(
		args: SliceMachineManagerCaptureSliceScreenshotArgs,
	): Promise<SliceMachineManagerCaptureSliceScreenshotReturnType> {
		const projectConfig = await this.getProjectConfig();

		const { data } = await captureSliceSimulatorScreenshot({
			sliceID: args.sliceID,
			libraryID: args.libraryID,
			variationID: args.variationID,
			projectConfig,
		});

		return {
			data,
		};
	}

	async readCustomTypeLibrary(
		args: CustomTypeLibraryReadHookData,
	): Promise<SliceMachineManagerReadCustomTypeLibraryReturnType> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"custom-type-library:read",
			args,
		);

		return {
			ids: hookResult.data[0]?.ids,
			errors: hookResult.errors,
		};
	}

	async createCustomType(
		args: CustomTypeCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeCreateHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"custom-type:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readCustomType(
		args: CustomTypeReadHookData,
	): Promise<SliceMachineManagerReadCustomTypeReturnType> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"custom-type:read",
			args,
		);

		return {
			model: hookResult.data[0]?.model,
			errors: hookResult.errors,
		};
	}

	async updateCustomType(
		args: CustomTypeUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeUpdateHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"custom-type:update",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Disallow until Custom Types can be deleted.
	async deleteCustomType(
		args: CustomTypeDeleteHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<CustomTypeDeleteHook>>> {
		assertPluginsInitialized(this._pluginRunner);

		const hookResult = await this._pluginRunner.callHook(
			"custom-type:delete",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async pushCustomType(
		_args: SliceMachineManagerPushCustomTypeArgs,
	): Promise<void> {
		assertPluginsInitialized(this._pluginRunner);

		// TODO: Push CustomType to Prismic.
	}
}
