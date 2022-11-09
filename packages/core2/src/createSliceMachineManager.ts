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
	createSliceMachinePluginRunner,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { captureSliceSimulatorScreenshot } from "./lib/captureSliceSimulatorScreenshot";
import { decodeSliceMachineConfig } from "./lib/decodeSliceMachineConfig";
import { loadModuleWithJiti } from "./lib/loadModuleWithJiti";
import { locateFileUpward } from "./lib/findFileUpward";

import { SliceMachineConfig } from "./types";
import { SLICE_MACHINE_CONFIG_FILENAMES } from "./constants";

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
	private _sliceMachinePluginRunner: SliceMachinePluginRunner | undefined;
	private _sliceMachineConfig: SliceMachineConfig | undefined;
	private _sliceMachineRoot: string | undefined;

	async getProjectRoot(): Promise<string> {
		if (this._sliceMachineRoot) {
			return this._sliceMachineRoot;
		}

		const sliceMachineConfigFilePath = await locateFileUpward(
			SLICE_MACHINE_CONFIG_FILENAMES,
		);

		this._sliceMachineRoot = path.dirname(sliceMachineConfigFilePath);

		return this._sliceMachineRoot;
	}

	async getSliceMachineConfig(): Promise<SliceMachineConfig> {
		if (this._sliceMachineConfig) {
			return this._sliceMachineConfig;
		} else {
			return await this.loadSliceMachineConfig();
		}
	}

	async loadSliceMachineConfig(): Promise<SliceMachineConfig> {
		const projectRoot = await this.getProjectRoot();

		let configModule: unknown | undefined;

		for (const configFileName of SLICE_MACHINE_CONFIG_FILENAMES) {
			const configFilePath = path.resolve(projectRoot, configFileName);

			try {
				await fs.access(configFilePath);
				configModule = loadModuleWithJiti(path.resolve(configFileName));
			} catch {
				// noop
			}
		}

		if (!configModule) {
			// TODO: Write a more friendly and useful message.
			throw new Error("No config found.");
		}

		const { value: sliceMachineConfig, errors } =
			decodeSliceMachineConfig(configModule);

		if (errors) {
			// TODO: Write a more friendly and useful message.
			throw new Error(`Invalid config. ${errors}`);
		}

		// Allow cached config reading using `SliceMachineManager.prototype.getProjectConfig()`.
		this._sliceMachineConfig = sliceMachineConfig;

		return sliceMachineConfig;
	}

	async initPlugins(): Promise<void> {
		const projectRoot = await this.getProjectRoot();
		const sliceMachineConfig = await this.getSliceMachineConfig();

		this._sliceMachinePluginRunner = createSliceMachinePluginRunner({
			project: {
				root: projectRoot,
				config: sliceMachineConfig,
			},
		});

		await this._sliceMachinePluginRunner.init();
	}

	async readSliceLibrary(
		args: SliceLibraryReadHookData,
	): Promise<SliceMachineManagerReadSliceLibraryReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice-library:read",
			args,
		);

		return {
			sliceIDs: hookResult.data[0]?.sliceIDs,
			errors: hookResult.errors,
		};
	}

	async readAllSlices() {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		return await this._sliceMachinePluginRunner.rawActions.readAllSliceModels();
	}

	async createSlice(
		args: SliceCreateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceCreateHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:create",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async readSlice(
		args: SliceReadHookData,
	): Promise<SliceMachineManagerReadSliceReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:read",
			args,
		);

		return {
			model: hookResult.data[0]?.model,
			errors: hookResult.errors,
		};
	}

	async updateSlice(
		args: SliceUpdateHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceUpdateHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:update",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	// TODO: Disallow until Slices can be deleted.
	async deleteSlice(
		args: SliceDeleteHookData,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceDeleteHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:delete",
			args,
		);

		return {
			errors: hookResult.errors,
		};
	}

	async pushSlice(_args: SliceMachineManagerPushSliceArgs): Promise<void> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Push Slice to Prismic.
	}

	async readSliceScreenshot(
		args: SliceMachineManagerReadSliceScreenshotArgs,
	): Promise<SliceMachineManagerReadSliceScreenshotReturnType> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:asset:read",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				assetID: `screenshot-${args.variationID}`,
			},
		);

		return {
			data: hookResult.data[0]?.data,
			errors: hookResult.errors,
		};
	}

	async updateSliceScreenshot(
		args: SliceMachineManagerUpdateSliceScreenshotArgs,
	): Promise<OnlyHookErrors<CallHookReturnType<SliceAssetUpdateHook>>> {
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
			"slice:asset:update",
			{
				libraryID: args.libraryID,
				sliceID: args.sliceID,
				asset: {
					id: `screenshot-${args.variationID}`,
					data: args.data,
				},
			},
		);

		return {
			errors: hookResult.errors,
		};
	}

	async captureSliceScreenshot(
		args: SliceMachineManagerCaptureSliceScreenshotArgs,
	): Promise<SliceMachineManagerCaptureSliceScreenshotReturnType> {
		const projectConfig = await this.getSliceMachineConfig();

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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		const hookResult = await this._sliceMachinePluginRunner.callHook(
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
		assertPluginsInitialized(this._sliceMachinePluginRunner);

		// TODO: Push CustomType to Prismic.
	}
}
