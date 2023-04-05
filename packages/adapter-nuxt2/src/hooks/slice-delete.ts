import type {
	SliceDeleteHook,
	SliceDeleteHookData,
	SliceMachineContext,
} from "@slicemachine/plugin-kit";
import * as fs from "node:fs/promises";

import { buildSliceDirectoryPath } from "../lib/buildSliceDirectoryPath";
import { rejectIfNecessary } from "../lib/rejectIfNecessary";
import { upsertGlobalContentTypes } from "../lib/upsertGlobalContentTypes";
import { upsertSliceLibraryIndexFile } from "../lib/upsertSliceLibraryIndexFile";

import type { PluginOptions } from "../types";

type Args = {
	data: SliceDeleteHookData;
} & SliceMachineContext<PluginOptions>;

const deleteSliceDir = async ({ data, helpers }: Args) => {
	const dir = buildSliceDirectoryPath({
		libraryID: data.libraryID,
		model: data.model,
		helpers,
	});

	await fs.rm(dir, { recursive: true });
};

export const sliceDelete: SliceDeleteHook<PluginOptions> = async (
	data,
	context,
) => {
	await deleteSliceDir({ data, ...context });

	rejectIfNecessary(
		await Promise.allSettled([
			upsertGlobalContentTypes(context),
			upsertSliceLibraryIndexFile({ libraryID: data.libraryID, ...context }),
		]),
	);
};
