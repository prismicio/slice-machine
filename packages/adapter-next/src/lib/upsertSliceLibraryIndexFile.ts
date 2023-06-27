import { SliceMachineContext } from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { NON_EDITABLE_FILE_BANNER } from "../constants";

import { PluginOptions } from "../types";

import { pascalCase } from "./pascalCase";
import { buildSliceLibraryDirectoryPath } from "./buildSliceLibraryDirectoryPath";
import { getJSFileExtension } from "./getJSFileExtension";

type UpsertSliceLibraryIndexFileArgs = {
	libraryID: string;
} & SliceMachineContext<PluginOptions>;

export const upsertSliceLibraryIndexFile = async (
	args: UpsertSliceLibraryIndexFileArgs,
): Promise<void> => {
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

	const slices = await args.actions.readAllSliceModelsForLibrary({
		libraryID: args.libraryID,
	});

	let contents: string;

	if (args.options.lazyLoadSlices) {
		contents = stripIndent`
			${NON_EDITABLE_FILE_BANNER}

			import dynamic from 'next/dynamic'

			export const components = {
				${slices
					.map((slice) => {
						const id = slice.model.id;
						const dirName = pascalCase(slice.model.name);

						return `${id}: dynamic(() => import('./${dirName}'))`;
					})
					.join(",\n")}
			}
		`;
	} else {
		contents = stripIndent`
			${NON_EDITABLE_FILE_BANNER}

			${slices
				.map((slice) => {
					const componentName = pascalCase(slice.model.name);
					const dirName = pascalCase(slice.model.name);

					return `import ${componentName} from "./${dirName}";`;
				})
				.join("\n")}

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

	if (args.options.format) {
		contents = await args.helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};
