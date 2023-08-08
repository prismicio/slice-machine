import { defineSliceMachinePlugin } from "@slicemachine/plugin-kit";
import {
	checkHasProjectFile,
	deleteCustomTypeDirectory,
	deleteCustomTypeFile,
	deleteSliceDirectory,
	deleteSliceFile,
	readCustomTypeFile,
	readCustomTypeLibrary,
	readCustomTypeModel,
	readSliceFile,
	readSliceLibrary,
	readSliceModel,
	renameSlice,
	upsertGlobalTypeScriptTypes,
	writeCustomTypeFile,
	writeCustomTypeModel,
	writeProjectFile,
	writeSliceFile,
	writeSliceModel,
} from "@slicemachine/plugin-kit/fs";

import { rejectIfNecessary } from "./lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "./lib/upsertSliceLibraryIndexFile";

import { name as pkgName } from "../package.json";
import { PluginOptions } from "./types";

import { sliceCreate } from "./hooks/slice-create";

export const plugin = defineSliceMachinePlugin<PluginOptions>({
	meta: {
		name: pkgName,
	},
	defaultOptions: {
		format: true,
	},
	setup({ hook }) {
		////////////////////////////////////////////////////////////////
		// project:*
		////////////////////////////////////////////////////////////////

		hook("project:init", async (data, context) => {
			data.installDependencies({
				dependencies: {
					"@prismicio/client": "latest",
					"@prismicio/svelte": "latest",
				},
			});

			const project = await context.helpers.getProject();

			// Add Slice Simulator URL.
			project.config.localSliceSimulatorURL ||=
				"http://localhost:5173/slice-simulator";

			// Nest the default Slice library in `./src/lib` if `./slices` is empty.
			if (
				(await checkHasProjectFile({
					filename: "./src/lib",
					helpers: context.helpers,
				})) &&
				project.config.libraries &&
				JSON.stringify(project.config.libraries) ===
					JSON.stringify(["./slices"])
			) {
				const sliceLibrary = await readSliceLibrary({
					libraryID: project.config.libraries[0],
					helpers: context.helpers,
				});

				if (sliceLibrary.sliceIDs.length < 1) {
					project.config.libraries = ["./src/lib/slices"];
				}
			}

			await writeProjectFile({
				filename: "slicemachine.config.json",
				contents: JSON.stringify(project.config, null, 2),
				format: context.options.format,
				helpers: context.helpers,
			});

			// Add generated TypeScript types file to {ts|js}config.json
			// TODO
		});

		////////////////////////////////////////////////////////////////
		// slice:*
		////////////////////////////////////////////////////////////////

		hook("slice:create", sliceCreate);
		hook("slice:update", async (data, context) => {
			await writeSliceModel({
				libraryID: data.libraryID,
				model: data.model,
				...context,
			});

			await upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				...context,
			});
		});
		hook("slice:rename", async (data, context) => {
			await renameSlice({
				libraryID: data.libraryID,
				model: data.model,
				format: context.options.format,
				...context,
			});

			rejectIfNecessary(
				await Promise.allSettled([
					upsertSliceLibraryIndexFile({
						libraryID: data.libraryID,
						...context,
					}),
					upsertGlobalTypeScriptTypes({
						filename: context.options.generatedTypesFilePath,
						format: context.options.format,
						...context,
					}),
				]),
			);
		});
		hook("slice:delete", async (data, context) => {
			await deleteSliceDirectory({
				libraryID: data.libraryID,
				model: data.model,
				...context,
			});

			rejectIfNecessary(
				await Promise.allSettled([
					upsertSliceLibraryIndexFile({
						libraryID: data.libraryID,
						...context,
					}),
					upsertGlobalTypeScriptTypes({
						filename: context.options.generatedTypesFilePath,
						format: context.options.format,
						...context,
					}),
				]),
			);
		});
		hook("slice:read", async (data, context) => {
			return await readSliceModel({
				libraryID: data.libraryID,
				sliceID: data.sliceID,
				...context,
			});
		});
		hook("slice:asset:update", async (data, context) => {
			await writeSliceFile({
				libraryID: data.libraryID,
				sliceID: data.sliceID,
				filename: data.asset.id,
				contents: data.asset.data,
				...context,
			});
		});
		hook("slice:asset:delete", async (data, context) => {
			await deleteSliceFile({
				libraryID: data.libraryID,
				sliceID: data.sliceID,
				filename: data.assetID,
				...context,
			});
		});
		hook("slice:asset:read", async (data, context) => {
			const file = await readSliceFile({
				libraryID: data.libraryID,
				sliceID: data.sliceID,
				filename: data.assetID,
				...context,
			});

			return {
				data: file,
			};
		});

		////////////////////////////////////////////////////////////////
		// slice-library:*
		////////////////////////////////////////////////////////////////

		hook("slice-library:read", async (data, context) => {
			return await readSliceLibrary({
				libraryID: data.libraryID,
				...context,
			});
		});

		////////////////////////////////////////////////////////////////
		// custom-type:*
		////////////////////////////////////////////////////////////////

		hook("custom-type:create", async (data, context) => {
			await writeCustomTypeModel({
				model: data.model,
				format: context.options.format,
				...context,
			});

			await upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				...context,
			});
		});
		hook("custom-type:update", async (data, context) => {
			await writeCustomTypeModel({
				model: data.model,
				format: context.options.format,
				...context,
			});

			await upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				...context,
			});
		});
		hook("custom-type:rename", async (data, context) => {
			await writeCustomTypeModel({
				model: data.model,
				format: context.options.format,
				...context,
			});

			await upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				...context,
			});
		});
		hook("custom-type:delete", async (data, context) => {
			await deleteCustomTypeDirectory({
				customTypeID: data.model.id,
				...context,
			});

			await upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				...context,
			});
		});
		hook("custom-type:read", async (data, context) => {
			return await readCustomTypeModel({
				customTypeID: data.id,
				...context,
			});
		});
		hook("custom-type:asset:update", async (data, context) => {
			await writeCustomTypeFile({
				customTypeID: data.customTypeID,
				filename: data.asset.id,
				contents: data.asset.data,
				...context,
			});
		});
		hook("custom-type:asset:delete", async (data, context) => {
			await deleteCustomTypeFile({
				customTypeID: data.customTypeID,
				filename: data.assetID,
				...context,
			});
		});
		hook("custom-type:asset:read", async (data, context) => {
			const file = await readCustomTypeFile({
				customTypeID: data.customTypeID,
				filename: data.assetID,
				...context,
			});

			return {
				data: file,
			};
		});

		////////////////////////////////////////////////////////////////
		// custom-type-library:*
		////////////////////////////////////////////////////////////////

		hook("custom-type-library:read", async (_data, context) => {
			return await readCustomTypeLibrary({
				helpers: context.helpers,
			});
		});

		////////////////////////////////////////////////////////////////
		// snippet:*
		////////////////////////////////////////////////////////////////

		hook("snippet:read", async (_data, _context) => {
			return [];
		});

		////////////////////////////////////////////////////////////////
		// documentation:*
		////////////////////////////////////////////////////////////////

		hook("documentation:read", async (_data, _context) => {
			return [];
		});

		////////////////////////////////////////////////////////////////
		// slice-simulator:*
		////////////////////////////////////////////////////////////////

		hook("slice-simulator:setup:read", async (_data, _context) => {
			return [
				{
					title: "Not supported",
					body: "Slice Simulator is currently not supported with SvelteKit. Support is coming soon.",
					description: "Support is coming soon.",
					validate: () => {
						return [
							{
								title: "Not supported",
								message:
									"Slice Simulator is currently not supported with SvelteKit. Support is coming soon.",
							},
						];
					},
				},
			];
		});
	},
});
