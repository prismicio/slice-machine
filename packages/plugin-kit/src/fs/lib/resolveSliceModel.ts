import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { SliceMachineActions } from "../../createSliceMachineActions";

export type ResolveSliceModelArgs =
	| {
			sliceID: string;
			libraryID: string;
			actions: SliceMachineActions;
	  }
	| {
			model: SharedSlice;
	  };

export async function resolveSliceModel(
	args: ResolveSliceModelArgs,
): Promise<SharedSlice> {
	if ("model" in args) {
		return args.model;
	}

	const { model } = await args.actions.readSliceModel({
		libraryID: args.libraryID,
		sliceID: args.sliceID,
	});

	return model;
}
