import type {
	SliceCreateHook,
	SliceCreateHookData,
	PluginSystemContext,
} from "@prismicio/plugin-kit";
import {
	upsertGlobalTypeScriptTypes,
	writeSliceFile,
	writeSliceModel,
} from "@prismicio/plugin-kit/fs";

import { checkIsTypeScriptProject } from "../lib/checkIsTypeScriptProject";
import { getSvelteMajor } from "../lib/getSvelteMajor";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";
import type { PluginOptions } from "../types";

import { sliceTemplate } from "./slice-create.templates";

type Args = {
	data: SliceCreateHookData;
} & PluginSystemContext<PluginOptions>;

const createComponentFile = async ({
	data,
	helpers,
	actions,
	options,
}: Args) => {
	const { model, componentContents } = data;

	const typescript = await checkIsTypeScriptProject({ helpers, options });
	const contents =
		componentContents ??
		sliceTemplate({ model, typescript, version: await getSvelteMajor() });

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
