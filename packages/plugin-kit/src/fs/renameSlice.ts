import * as fse from "fs-extra";

import { SliceMachineActions } from "../createSliceMachineActions";

import {
	buildSliceDirectoryPath,
	BuildSliceDirectoryPathArgs,
} from "./buildSliceDirectoryPath";
import { writeSliceModel, WriteSliceModelArgs } from "./writeSliceModel";

export type RenameSliceArgs = {
	actions: SliceMachineActions;
} & Omit<BuildSliceDirectoryPathArgs, "sliceID"> &
	WriteSliceModelArgs;

export const renameSlice = async (args: RenameSliceArgs): Promise<void> => {
	const { model: existingModel } = await args.actions.readSliceModel({
		libraryID: args.libraryID,
		sliceID: args.model.id,
	});

	await fse.move(
		await buildSliceDirectoryPath({
			...args,
			model: existingModel,
			absolute: true,
		}),
		await buildSliceDirectoryPath({
			...args,
			absolute: true,
		}),
	);

	await writeSliceModel(args);
};
