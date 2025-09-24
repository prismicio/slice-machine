import { HookSystem } from "./lib/HookSystem";
import { SliceMachineHooks, SliceMachineProject } from "./types";

import { CustomTypeLibraryReadHookReturnType } from "./hooks/customTypeLibrary-read";
import {
	CustomTypeReadHookData,
	CustomTypeReadHookReturnType,
} from "./hooks/customType-read";
import {
	SliceLibraryReadHookData,
	SliceLibraryReadHookReturnType,
} from "./hooks/sliceLibrary-read";
import { SliceReadHookData, SliceReadHookReturnType } from "./hooks/slice-read";

export type ReadAllSliceModelsActionArgs<
	TWithMetadata extends boolean = false,
> = {
	withMetadata?: TWithMetadata;
};

export type ReadAllSliceModelsActionReturnType = (SliceReadHookReturnType & {
	libraryID: string;
})[];

export type ReadAllSliceModelsForLibraryActionArgs = {
	libraryID: string;
};

/**
 * Creates Slice Machine actions.
 *
 * @internal
 */
export const createSliceMachineActions = (
	project: SliceMachineProject,
	hookSystem: HookSystem<SliceMachineHooks>,
): SliceMachineActions => {
	return new SliceMachineActions(project, hookSystem);
};

/**
 * Slice Machine actions shared to plugins and hooks.
 */
export class SliceMachineActions {
	/**
	 * The Slice Machine project's metadata.
	 *
	 * @internal
	 */
	private _project: SliceMachineProject;
	/**
	 * The actions' hook system used to internally trigger hook calls.
	 *
	 * @internal
	 */
	private _hookSystem: HookSystem<SliceMachineHooks>;

	constructor(
		project: SliceMachineProject,
		hookSystem: HookSystem<SliceMachineHooks>,
	) {
		this._project = project;
		this._hookSystem = hookSystem;
	}

	readAllSliceModels =
		async (): Promise<ReadAllSliceModelsActionReturnType> => {
			const libraryIDs = this._project.config.libraries || [];

			return (
				await Promise.all(
					libraryIDs.map(async (libraryID) => {
						const models = await this.readAllSliceModelsForLibrary({
							libraryID,
						});

						return models.map((model) => {
							return {
								libraryID,
								...model,
							};
						});
					}),
				)
			).flat();
		};

	readAllSliceModelsForLibrary = async (
		args: ReadAllSliceModelsForLibraryActionArgs,
	): Promise<SliceReadHookReturnType[]> => {
		const { sliceIDs } = await this.readSliceLibrary({
			libraryID: args.libraryID,
		});

		return await Promise.all(
			sliceIDs.map(async (sliceID) => {
				return await this.readSliceModel({
					libraryID: args.libraryID,
					sliceID,
				});
			}),
		);
	};

	readSliceModel = async (
		args: SliceReadHookData,
	): Promise<SliceReadHookReturnType> => {
		const {
			data: [model],
			errors: [cause],
		} = await this._hookSystem.callHook("slice:read", {
			libraryID: args.libraryID,
			sliceID: args.sliceID,
		});

		if (!model) {
			throw new Error(
				`Slice \`${args.sliceID}\` not found in the \`${args.libraryID}\` library.`,
				{ cause },
			);
		}

		return model;
	};

	readSliceLibrary = async (
		args: SliceLibraryReadHookData,
	): Promise<SliceLibraryReadHookReturnType> => {
		const {
			data: [library],
			errors: [cause],
		} = await this._hookSystem.callHook("slice-library:read", {
			libraryID: args.libraryID,
		});

		if (!library) {
			throw new Error(`Slice library \`${args.libraryID}\` not found.`, {
				cause,
			});
		}

		return library;
	};

	readAllCustomTypeModels = async (): Promise<
		CustomTypeReadHookReturnType[]
	> => {
		const { ids } = await this.readCustomTypeLibrary();

		return await Promise.all(
			ids.map(async (id) => {
				return this.readCustomTypeModel({ id });
			}),
		);
	};

	readCustomTypeModel = async (
		args: CustomTypeReadHookData,
	): Promise<CustomTypeReadHookReturnType> => {
		const {
			data: [model],
			errors: [cause],
		} = await this._hookSystem.callHook("custom-type:read", {
			id: args.id,
		});

		if (!model) {
			throw new Error(`Custom type \`${args.id}\` not found.`, { cause });
		}

		return model;
	};

	readCustomTypeLibrary =
		async (): Promise<CustomTypeLibraryReadHookReturnType> => {
			const {
				data: [library],
				errors: [cause],
			} = await this._hookSystem.callHook(
				"custom-type-library:read",
				undefined,
			);

			if (!library) {
				throw new Error(`Couldn't read custom type library.`, {
					cause,
				});
			}

			return library;
		};
}
