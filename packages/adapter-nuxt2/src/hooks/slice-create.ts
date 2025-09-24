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

import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

type CreateComponentFileArgs = {
	data: SliceCreateHookData;
} & SliceMachineContext<PluginOptions>;

const createComponentFile = async ({
	data,
	helpers,
	actions,
	options,
}: CreateComponentFileArgs) => {
	const contents =
		data.componentContents ??
		stripIndent`
			<template>
				<section
					:data-slice-type="slice.slice_type"
					:data-slice-variation="slice.variation"
				>
					Placeholder component for ${data.model.id} (variation: {{ slice.variation }}) Slices
					<br />
					<strong>You can edit this slice directly in your code editor.</strong>
					<!--
					💡 Use the Prismic MCP server with your code editor
					📚 Docs: https://prismic.io/docs/ai#code-with-prismics-mcp-server
					-->
				</section>
			</template>

			<script>
			import { getSliceComponentProps } from "@prismicio/vue/components";

			export default {
				// The array passed to \`getSliceComponentProps\` is purely optional.
				// Consider it as a visual hint for you when templating your slice.
				props: getSliceComponentProps(["slice", "index", "slices", "context"]),
			};
			</script>
		`;

	await writeSliceFile({
		libraryID: data.libraryID,
		model: data.model,
		filename: "index.vue",
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
