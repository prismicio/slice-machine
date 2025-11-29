import * as path from "node:path";

import { PluginSystemContext } from "@prismicio/plugin-kit";
import {
	buildSliceDirectoryPath,
	buildSliceLibraryDirectoryPath,
	writeProjectFile,
} from "@prismicio/plugin-kit/fs";
import { stripIndent } from "common-tags";

import { NON_EDITABLE_FILE_BANNER } from "../constants";
import { PluginOptions } from "../types";

import { getJSFileExtension } from "./getJSFileExtension";
import { pascalCase } from "./pascalCase";

type UpsertSliceLibraryIndexFileArgs = {
	libraryID: string;
} & PluginSystemContext<PluginOptions>;

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

							return `${id}: () => import(/* webpackChunkName: "prismic__${args.libraryID.replace(
								/[^\w]/g,
								"",
							)}__${id}" */ "./${dirName}/index.vue")`;
						}),
					)
				).join(",\n")}
			};
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

						return `import ${componentName} from "./${dirName}/index.vue";`;
					}),
				)
			).join("\n")}

			export const components = {
				${slices
					.map((slice) => {
						const id = slice.model.id;
						const componentName = pascalCase(slice.model.name);

						return `${id}: ${componentName}`;
					})
					.join(",\n")}
			};
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
