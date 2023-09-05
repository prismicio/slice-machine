import * as t from "io-ts";
import {
	HookError,
	SliceTemplateLibraryReadHookData,
} from "@slicemachine/plugin-kit";
import { BaseManager } from "../BaseManager";
import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

type SliceTemplateLibraryManagerReadReturnType = {
	templates: {
		model: SharedSlice;
		screenshots: Record<string, Buffer>;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryManagerGetReturnType = {
	data?: {
		sliceIds: string[];
	};
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryManagerGetData = {
	templateIds: string[];
};

export class SliceTemplateLibraryManager extends BaseManager {
	async read(
		args: SliceTemplateLibraryReadHookData,
	): Promise<SliceTemplateLibraryManagerReadReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const isTypeScriptProject = await this.project.checkIsTypeScript();
		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice-template-library:read",
			{ ...args, isTypeScriptProject },
		);

		const { data, errors } = decodeHookResult(
			t.type({
				templates: t.array(
					t.type({
						mocks: t.string,
						componentContents: t.string,
						model: SharedSlice,
						screenshots: t.any,
					}),
				),
			}),
			hookResult,
		);

		return {
			templates: data.flat()[0].templates,
			errors,
		};
	}
	async create(
		args: SliceTemplateLibraryManagerGetData,
	): Promise<SliceTemplateLibraryManagerGetReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		// Reading all available slice templates
		const isTypeScriptProject = await this.project.checkIsTypeScript();
		const hookReadResult = await this.sliceMachinePluginRunner.callHook(
			"slice-template-library:read",
			{ ...args, isTypeScriptProject },
		);
		const { data: readData, errors: readErrors } = decodeHookResult(
			t.type({
				templates: t.array(
					t.type({
						mocks: t.string,
						componentContents: t.string,
						model: SharedSlice,
						screenshots: t.any,
					}),
				),
			}),
			hookReadResult,
		);
		if (readErrors.length > 0) {
			return {
				errors: readErrors,
			};
		}

		// Extract all existing slice IDs into an array
		const { libraries } = await this.slices.readAllSliceLibraries();
		const existingIds: string[] = [];
		libraries.forEach((lib) => {
			if (lib.sliceIDs) {
				existingIds.push(...lib.sliceIDs);
			}
		});

		// Create a function to get the next available ID based on the baseId
		const getNextAvailableSlice = (baseId: string) => {
			let nextId = baseId;
			let counter = 1;
			while (existingIds.includes(nextId)) {
				counter++;
				nextId = `${baseId}_${counter}`;
			}
			existingIds.push(nextId);

			return { id: nextId, counter };
		};

		// Extract the slices to create from the template ids given in args
		const slicesToCreate = readData.flat()[0].templates.map((template) => {
			const { id, counter } = getNextAvailableSlice(template.model.id);

			return {
				...template,
				model: {
					...template.model,
					id,
					name:
						counter > 1 ? template.model.name + counter : template.model.name,
				},
			};
		});

		// Initiate the slice creation process for all slices
		const creationPromises = slicesToCreate.map((slice) => {
			assertPluginsInitialized(this.sliceMachinePluginRunner);

			return this.sliceMachinePluginRunner.callHook("slice:create", {
				libraryID: libraries[0].libraryID,
				model: slice.model,
				componentContents: slice.componentContents,
			});
		});

		// Wait for all slices to be created
		const creationResults = await Promise.all(creationPromises);

		// Check for any errors in the creation results
		const errors = creationResults.flatMap((result) => result.errors);

		if (errors.length > 0) {
			return {
				errors: errors,
			};
		}

		// Extract the slice IDs from the creation results (assuming each result has an ID)
		const sliceIds = slicesToCreate.map((slice) => slice.model.id);

		return {
			data: {
				sliceIds,
			},
			errors: [],
		};
	}
}
