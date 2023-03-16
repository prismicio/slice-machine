import type { SliceRenameHook } from "@slicemachine/plugin-kit";
import * as fse from "fs-extra";

import { buildSliceDirectoryPath } from "../lib/buildSliceDirectoryPath";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { updateSliceModelFile } from "../lib/updateSliceModelFile";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

export const sliceRename: SliceRenameHook<PluginOptions> = async (
	data,
	context,
) => {
	const { model: currentModel } = await context.actions.readSliceModel({
		libraryID: data.libraryID,
		sliceID: data.model.id,
	});

	await fse.move(
		buildSliceDirectoryPath({
			libraryID: data.libraryID,
			model: currentModel,
			helpers: context.helpers,
		}),
		buildSliceDirectoryPath({
			libraryID: data.libraryID,
			model: data.model,
			helpers: context.helpers,
		}),
	);

	await updateSliceModelFile({
		libraryID: data.libraryID,
		model: data.model,
		...context,
	});

	rejectIfNecessary(
		await Promise.allSettled([
			upsertGlobalContentTypes(context),
			upsertSliceLibraryIndexFile({ libraryID: data.libraryID, ...context }),
		]),
	);
};
