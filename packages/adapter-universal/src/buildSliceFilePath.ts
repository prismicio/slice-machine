import {
	SliceMachineActions,
	SliceMachineHelpers,
} from "@slicemachine/plugin-kit";
import * as path from "node:path";

import { buildSliceDirectoryPath } from "./buildSliceDirectoryPath";

export type BuildSliceFilePathArgs = {
	libraryID: string;
	sliceID: string;
	filename: string;
	actions: SliceMachineActions;
	helpers: SliceMachineHelpers;
};

export const buildSliceFilePath = async (
	args: BuildSliceFilePathArgs,
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
		args.filename,
	);
};
