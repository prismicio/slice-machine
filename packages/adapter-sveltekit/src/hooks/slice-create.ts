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
import { source } from "common-tags";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
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
	const pascalName = pascalCase(data.model.name);

	let contents: string;

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	const placeholder = `
		Placeholder component for {slice.slice_type} (variation: {slice.variation}) slices.
		<br />
		<strong>You can edit this slice directly in your code editor.</strong>
		<!--
	💡 Use Prismic MCP with your code editor

	Get AI-powered help to build your slice components — based on your actual model.

	▶️ Setup:
	1. Add a new MCP Server in your code editor:

	{
		"mcpServers": {
			"Prismic MCP": {
				"command": "npx",
				"args": ["-y", "@prismicio/mcp-server"]
			}
		}
	}

	2. Select Claude 3.7 Sonnet (recommended for optimal output)

	✅ Then open your slice file and ask your code editor:
		"Code this slice"

	Your code editor reads your slice model and helps you code faster ⚡
	📚 Give your feedback: https://community.prismic.io/t/help-us-shape-the-future-of-slice-creation/19505
-->`;

	if (data.componentContents) {
		contents = data.componentContents;
	} else if (isTypeScriptProject) {
		contents = source`
			<script lang="ts">
				import type { Content } from '@prismicio/client';

				export let slice: Content.${pascalName}Slice;
			</script>

			<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
				${placeholder}
			</section>
		`;
	} else {
		contents = source`
			<script>
				/** @type {import("@prismicio/client").Content.${pascalName}Slice} */
				export let slice;
			</script>

			<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
				${placeholder}
			</section>
		`;
	}

	await writeSliceFile({
		libraryID: data.libraryID,
		model: data.model,
		filename: "index.svelte",
		contents,
		format: options.format,
		actions,
		helpers,
		formatOptions: {
			prettier: {
				plugins: ["prettier-plugin-svelte"],
				parser: "svelte",
			},
		},
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
