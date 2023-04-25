import { SliceMachineContext } from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { PluginOptions } from "../types";

import { buildSliceDirectoryPath } from "./buildSliceDirectoryPath";

type BuildSliceAssetPathArgs = {
	libraryID: string;
	sliceID: string;
	assetID: string;
	actions: SliceMachineContext<PluginOptions>["actions"];
	helpers: SliceMachineContext<PluginOptions>["helpers"];
};

export const buildSliceAssetPath = async (
	args: BuildSliceAssetPathArgs,
): Promise<string> => {
	const { model } = await args.actions.readSliceModel({
		libraryID: args.libraryID,
		sliceID: args.sliceID,
	});

	return path.join(
		buildSliceDirectoryPath({
			libraryID: args.libraryID,
			model,
			helpers: args.helpers,
		}),
		args.assetID,
	);
};
