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

import { getJSFileExtension } from "./getJSFileExtension";
import { pascalCase } from "./pascalCase";

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

			import { defineAsyncComponent } from "vue";
			import { defineSliceZoneComponents } from "@prismicio/vue";

			export const components = defineSliceZoneComponents({
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

							return `${id}: defineAsyncComponent(() => import("./${dirName}/index.vue"))`;
						}),
					)
				).join(",\n")}
			});
		`;
	} else {
		contents = stripIndent`
			${NON_EDITABLE_FILE_BANNER}

			import { defineSliceZoneComponents } from "@prismicio/vue";

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

			export const components = defineSliceZoneComponents({
				${slices
					.map((slice) => {
						const id = slice.model.id;
						const componentName = pascalCase(slice.model.name);

						return `${id}: ${componentName}`;
					})
					.join(",\n")}
			});
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
