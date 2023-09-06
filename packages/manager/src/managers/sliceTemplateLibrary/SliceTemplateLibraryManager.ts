import * as t from "io-ts";
import { HookError } from "@slicemachine/plugin-kit";
import { BaseManager } from "../BaseManager";
import { DecodeError } from "../../lib/DecodeError";
import { assertPluginsInitialized } from "../../lib/assertPluginsInitialized";
import { decodeHookResult } from "../../lib/decodeHookResult";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { SharedSliceContent } from "@prismicio/types-internal/lib/content";

type SliceTemplateLibraryManagerReadReturnType = {
	templates: {
		model: SharedSlice;
		screenshots: Record<string, Buffer>;
	}[];
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryManagerCreateReturnType = {
	data?: {
		sliceIDs: string[];
	};
	errors: (DecodeError | HookError)[];
};

type SliceTemplateLibraryReadData = {
	templateIDs?: string[];
};

type SliceTemplateLibraryCreateData = SliceTemplateLibraryReadData;

const readHookCodec = t.type({
	templates: t.array(
		t.type({
			model: SharedSlice,
			componentContents: t.string,
			mocks: t.array(SharedSliceContent),
			screenshots: t.record(t.string, t.any),
		}),
	),
});

export class SliceTemplateLibraryManager extends BaseManager {
	async read(
		args: SliceTemplateLibraryReadData,
	): Promise<SliceTemplateLibraryManagerReadReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		const hookResult = await this.sliceMachinePluginRunner.callHook(
			"slice-template-library:read",
			args,
		);

		const { data, errors } = decodeHookResult(readHookCodec, hookResult);

		return {
			templates: data.flat()[0].templates,
			errors,
		};
	}
	async create(
		args: SliceTemplateLibraryCreateData,
	): Promise<SliceTemplateLibraryManagerCreateReturnType> {
		assertPluginsInitialized(this.sliceMachinePluginRunner);

		// Reading all available slice templates
		const hookReadResult = await this.sliceMachinePluginRunner.callHook(
			"slice-template-library:read",
			args,
		);
		const { data: readData, errors: readErrors } = decodeHookResult(
			readHookCodec,
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
			return this.slices.createSlice({
				libraryID: libraries[0].libraryID,
				model: slice.model,
				componentContents: slice.componentContents,
			});
		});

		// Wait for all slices to be created
		const creationResults = await Promise.all(creationPromises);
		// Check for any errors in the creation results
		const creationErrors = creationResults.flatMap((result) => result.errors);
		if (creationErrors.length) {
			return {
				errors: creationErrors,
			};
		}

		const mocksPromises = slicesToCreate.map((slice) => {
			return this.slices.updateSliceMocks({
				libraryID: libraries[0].libraryID,
				sliceID: slice.model.id,
				mocks: slice.mocks,
			});
		});

		const mocksResults = await Promise.all(mocksPromises);

		const sliceScreenshotsPromises = slicesToCreate.map((slice) => {
			const screenshotPromises = Object.entries(slice.screenshots).map(
				([variationID, data]) => {
					return this.slices.updateSliceScreenshot({
						libraryID: libraries[0].libraryID,
						sliceID: slice.model.id,
						variationID,
						data,
					});
				},
			);

			return Promise.all(screenshotPromises);
		});

		const sliceScreenshotsResults = await Promise.all(sliceScreenshotsPromises);
		const mocksErrors = mocksResults.flatMap((result) => result.errors);
		const screenshotErrors = sliceScreenshotsResults.flatMap((result) =>
			result.flat().flatMap((r) => r.errors),
		);

		// Extract the slice IDs from the creation results (assuming each result has an ID)
		const sliceIDs = slicesToCreate.map((slice) => slice.model.id);

		return {
			errors: [...mocksErrors, ...screenshotErrors],
			data: {
				sliceIDs,
			},
		};
	}
}
