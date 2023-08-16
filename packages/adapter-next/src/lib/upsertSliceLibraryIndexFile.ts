import { SliceMachineContext } from "@slicemachine/plugin-kit";
import {
	buildSliceDirectoryPath,
	buildSliceLibraryDirectoryPath,
	writeProjectFile,
} from "@slicemachine/plugin-kit/fs";
import { stripIndent } from "common-tags";
import * as path from "node:path";
import { NON_EDITABLE_FILE_BANNER } from "../constants";

import { PluginOptions } from "../types";

import { pascalCase } from "./pascalCase";
import { getJSFileExtension } from "./getJSFileExtension";

type UpsertSliceLibraryIndexFileArgs = {
	libraryID: string;
} & SliceMachineContext<PluginOptions>;

export const upsertSliceLibraryIndexFile = async (
	args: UpsertSliceLibraryIndexFileArgs,
): Promise<void> => {
	const slices = await args.actions.readAllSliceModelsForLibrary({
		libraryID: args.libraryID,
	});

	let contents: string;

	if (args.options.lazyLoadSlices) {
		contents = stripIndent`
			${NON_EDITABLE_FILE_BANNER}

			import dynamic from 'next/dynamic'

			export const components = {
				${(
					await Promise.all(
						slices.map(async (slice) => {
							const id = slice.model.id;
							const dirName = path.basename(
								await buildSliceDirectoryPath({
									model: slice.model,
									helpers: args.helpers,
									libraryID: args.libraryID,
								}),
							);

							return `${id}: dynamic(() => import('./${dirName}'))`;
						}),
					)
				).join(",\n")}
			}
		`;
	} else {
		contents = stripIndent`
			${NON_EDITABLE_FILE_BANNER}

			${(
				await Promise.all(
					slices.map(async (slice) => {
						const dirName = path.basename(
							await buildSliceDirectoryPath({
								model: slice.model,
								helpers: args.helpers,
								libraryID: args.libraryID,
							}),
						);
						const componentName = pascalCase(slice.model.name);

						return `import ${componentName} from "./${dirName}";`;
					}),
				)
			).join("\n")}

			export const components = {
				${slices
					.map((slice) => {
						const id = slice.model.id;
						const componentName = pascalCase(slice.model.name);

						return `${id}: ${componentName},`;
					})
					.join("\n")}
			}
		`;
	}

	const extension = await getJSFileExtension({
		helpers: args.helpers,
		options: args.options,
	});
	const filePath = path.join(
		buildSliceLibraryDirectoryPath({
			libraryID: args.libraryID,
			helpers: args.helpers,
		}),
		`index.${extension}`,
	);

	await writeProjectFile({
		filename: filePath,
		contents,
		format: args.options.format,
		helpers: args.helpers,
	});
};
