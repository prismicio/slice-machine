import type {
	SliceCreateHook,
	SliceCreateHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildSliceDirectoryPath } from "../lib/buildSliceDirectoryPath";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getJSFileExtension } from "../lib/getJSFileExtension";
import { pascalCase } from "../lib/pascalCase";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { updateSliceModelFile } from "../lib/updateSliceModelFile";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

type Args = {
	dir: string;
	data: SliceCreateHookData;
} & SliceMachineContext<PluginOptions>;

const createComponentFile = async ({ dir, data, helpers, options }: Args) => {
	const extension = await getJSFileExtension({ helpers, options, jsx: true });
	const filePath = path.join(dir, `index.${extension}`);
	const model = data.model;
	const pascalName = pascalCase(model.name);

	let contents: string;

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (isTypeScriptProject) {
		contents = stripIndent`
			import { Content } from "@prismicio/client";
			import { SliceComponentProps } from "@prismicio/react";

			/**
			 * Props for \`${pascalName}\`.
			 */
			export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;

			/**
			 * Component for "${model.name}" Slices.
			 */
			const ${pascalName} = ({ slice }: ${pascalName}Props): JSX.Element => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
					>
						Placeholder component for ${model.id} (variation: {slice.variation}) Slices
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
						Placeholder component for ${model.id} (variation: {slice.variation}) Slices
					</section>
				);
			};

			export default ${pascalName};
		`;
	}

	if (options.format) {
		contents = await helpers.format(contents, filePath);
	}

	await fs.writeFile(filePath, contents);
};

export const sliceCreate: SliceCreateHook<PluginOptions> = async (
	data,
	context,
) => {
	const dir = buildSliceDirectoryPath({
		libraryID: data.libraryID,
		model: data.model,
		helpers: context.helpers,
	});

	await fs.mkdir(dir, { recursive: true });

	rejectIfNecessary(
		await Promise.allSettled([
			updateSliceModelFile({
				libraryID: data.libraryID,
				model: data.model,
				...context,
			}),
			createComponentFile({ dir, data, ...context }),
		]),
	);

	rejectIfNecessary(
		await Promise.allSettled([
			upsertGlobalContentTypes(context),
			upsertSliceLibraryIndexFile({ libraryID: data.libraryID, ...context }),
		]),
	);
};
