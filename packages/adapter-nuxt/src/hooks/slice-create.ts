import type {
	SliceCreateHook,
	SliceCreateHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import { stripIndent } from "common-tags";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import { buildSliceDirectoryPath } from "../lib/buildSliceDirectoryPath";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { updateSliceModelFile } from "../lib/updateSliceModelFile";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";
import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { pascalCase } from "../lib/pascalCase";

import type { PluginOptions } from "../types";

type Args = {
	dir: string;
	data: SliceCreateHookData;
} & SliceMachineContext<PluginOptions>;

const createComponentFile = async ({ dir, data, helpers, options }: Args) => {
	const filePath = path.join(dir, "index.vue");
	const model = data.model;
	const pascalName = pascalCase(model.name);

	let contents: string;

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (isTypeScriptProject) {
		contents = stripIndent`
			<template>
				<section
					:data-slice-type="slice.slice_type"
					:data-slice-variation="slice.variation"
				>
					Placeholder component for ${model.id} (variation: {{ slice.variation }}) Slices
				</section>
			</template>

			<script setup lang="ts">
			import { Content } from "@prismicio/client";

			// The array passed to \`getSliceComponentProps\` is purely optional.
			// Consider it as a visual hint for you when templating your slice.
			defineProps(getSliceComponentProps<Content.${pascalName}Slice>(
				["slice", "index", "slices", "context"]
			));
			</script>
		`;
	} else {
		contents = stripIndent`
			<template>
				<section
					:data-slice-type="slice.slice_type"
					:data-slice-variation="slice.variation"
				>
					Placeholder component for {{ model.id }} (variation: {{ slice.variation }}) Slices
				</section>
			</template>

			<script setup>
			// The array passed to \`getSliceComponentProps\` is purely optional.
			// Consider it as a visual hint for you when templating your slice.
			defineProps(getSliceComponentProps(["slice", "index", "slices", "context"]));
			</script>
		`;
	}

	if (options.format) {
		contents = await helpers.format(contents, filePath, {
			prettier: { parser: "vue" },
		});
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
