import type {
	SliceCreateHook,
	SliceCreateHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import {
	upsertGlobalTypeScriptTypes,
	writeSliceFile,
	writeSliceModel,
} from "@slicemachine/plugin-kit/fs";
import { stripIndent } from "common-tags";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";
import { pascalCase } from "../lib/pascalCase";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

type Args = {
	data: SliceCreateHookData;
} & SliceMachineContext<PluginOptions>;

const createComponentFile = async ({
	data,
	helpers,
	actions,
	options,
}: Args) => {
	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const filename = `index.${extension}`;
	const pascalName = pascalCase(data.model.name);

	let contents: string;

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (data.componentContents) {
		contents = data.componentContents;
	} else if (isTypeScriptProject) {
		contents = stripIndent`
			import { Content } from "@prismicio/client";
			import { SliceComponentProps } from "@prismicio/react";

			/**
			 * Props for \`${pascalName}\`.
			 */
			export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;

			/**
			 * Component for "${data.model.name}" Slices.
			 */
			const ${pascalName} = ({ slice }: ${pascalName}Props): JSX.Element => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
					>
						Placeholder component for ${data.model.id} (variation: {slice.variation}) Slices
					</section>
				);
			};

			export default ${pascalName}
		`;
	} else {
		contents = stripIndent`
			/**
			 * @typedef {import("@prismicio/client").Content.${pascalName}Slice} ${pascalName}Slice
			 * @typedef {import("@prismicio/react").SliceComponentProps<${pascalName}Slice>} ${pascalName}Props
			 * @param {${pascalName}Props}
			 */
			const ${pascalName} = ({ slice }) => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
					>
						Placeholder component for ${data.model.id} (variation: {slice.variation}) Slices
					</section>
				);
			};

			export default ${pascalName};
		`;
	}

	await writeSliceFile({
		libraryID: data.libraryID,
		model: data.model,
		filename,
		contents,
		format: options.format,
		actions,
		helpers,
	});
};

export const sliceCreate: SliceCreateHook<PluginOptions> = async (
	data,
	context,
) => {
	rejectIfNecessary(
		await Promise.allSettled([
			writeSliceModel({
				libraryID: data.libraryID,
				model: data.model,
				format: context.options.format,
				helpers: context.helpers,
			}),
			createComponentFile({ data, ...context }),
		]),
	);

	rejectIfNecessary(
		await Promise.allSettled([
			upsertSliceLibraryIndexFile({
				libraryID: data.libraryID,
				...context,
			}),
			upsertGlobalTypeScriptTypes({
				filename: context.options.generatedTypesFilePath,
				format: context.options.format,
				helpers: context.helpers,
				actions: context.actions,
			}),
		]),
	);
};
