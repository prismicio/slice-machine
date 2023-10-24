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
import { pascalCase } from "../lib/pascalCase";
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
			<script setup lang="ts">
			import { type Content } from "@prismicio/client";

			// The array passed to \`getSliceComponentProps\` is purely optional.
			// Consider it as a visual hint for you when templating your slice.
			defineProps(getSliceComponentProps<Content.${pascalName}Slice>(
				["slice", "index", "slices", "context"]
			));
			</script>

			<template>
				<section
					:data-slice-type="slice.slice_type"
					:data-slice-variation="slice.variation"
				>
					Placeholder component for ${data.model.id} (variation: {{ slice.variation }}) Slices
				</section>
			</template>
		`;
	} else {
		contents = stripIndent`
			<script setup>
			// The array passed to \`getSliceComponentProps\` is purely optional.
			// Consider it as a visual hint for you when templating your slice.
			defineProps(getSliceComponentProps(["slice", "index", "slices", "context"]));
			</script>

			<template>
				<section
					:data-slice-type="slice.slice_type"
					:data-slice-variation="slice.variation"
				>
					Placeholder component for {{ model.id }} (variation: {{ slice.variation }}) Slices
				</section>
			</template>
		`;
	}

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
