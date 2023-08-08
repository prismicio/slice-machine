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
	const filename = `index.svelte`;
	const pascalName = pascalCase(data.model.name);

	let contents: string;

	const isTypeScriptProject = await checkIsTypeScriptProject({
		helpers,
		options,
	});

	if (isTypeScriptProject) {
		contents = source`
			<script lang="ts">
				import type { Content } from '@prismicio/client';
				import type { SliceLike } from '@prismicio/svelte';

				export let slice: Content.${pascalName}Slice;
				export let slices: SliceLike[];
				export let index: number;
				export let context: unknown;
			</script>

			<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
				Placeholder component for ${data.model.id} (variation: {slice.variation}) Slices
			</section>
		`;
	} else {
		contents = source`
			<script>
				/** @type {import("@prismicio/client").Content.TextSlice} */
				export let slice;
				/** @type {import("@prismicio/svelte").SliceLike[]} */
				export let slices;
				/** @type {number} */
				export let index;
				/** @type {unknown} */
				export let context;
			</script>

			<section data-slice-type={slice.slice_type} data-slice-variation={slice.variation}>
				Placeholder component for text (variation: {slice.variation}) Slices
			</section>
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
