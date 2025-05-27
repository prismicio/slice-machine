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

	const placeholder = `
		Placeholder component for ${data.model.id} (variation: {slice.variation}) slices.
		<br />
		<strong>You can edit this slice directly in your code editor.</strong>
		{/**
		 * 💡 Use Prismic MCP with your code editor
		 *
		 * Get AI-powered help to build your slice components — based on your actual model.
		 *
		 * ▶️ Setup:
		 * 1. Add a new MCP Server in your code editor:
		 *
		 * {
		 *   "mcpServers": {
		 *     "Prismic MCP": {
		 *       "command": "npx",
		 *       "args": ["-y", "@prismicio/mcp-server"]
		 *     }
		 *   }
		 * }
		 *
		 * 2. Select a model optimized for coding (e.g. Claude 3.7 Sonnet or similar)
		 *
		 * ✅ Then open your slice file and ask your code editor:
		 *    "Code this slice"
		 *
		 * Your code editor reads your slice model and helps you code faster ⚡
		 * 📚 Give your feedback: https://community.prismic.io/t/help-us-shape-the-future-of-slice-creation/19505
		 */}`;

	if (data.componentContents) {
		contents = data.componentContents;
	} else if (isTypeScriptProject) {
		contents = stripIndent`
			import { FC } from "react";
			import { Content } from "@prismicio/client";
			import { SliceComponentProps } from "@prismicio/react";

			/**
			 * Props for \`${pascalName}\`.
			 */
			export type ${pascalName}Props = SliceComponentProps<Content.${pascalName}Slice>;

			/**
			 * Component for "${data.model.name}" Slices.
			 */
			const ${pascalName}: FC<${pascalName}Props> = ({ slice }) => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
					>
						${placeholder}
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
			 * @type {import("react").FC<${pascalName}Props>}
			 */
			const ${pascalName} = ({ slice }) => {
				return (
					<section
						data-slice-type={slice.slice_type}
						data-slice-variation={slice.variation}
					>
						${placeholder}
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
