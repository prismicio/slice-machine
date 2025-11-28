import TypesInternal from "@prismicio/types-internal/lib/customtypes/index.js";

import { PluginSystemActions } from "../../createPluginSystemActions";

export type ResolveSliceModelArgs =
	| {
			sliceID: string;
			libraryID: string;
			actions: PluginSystemActions;
	  }
	| {
			model: TypesInternal.SharedSlice;
	  };

export async function resolveSliceModel(
	args: ResolveSliceModelArgs,
): Promise<TypesInternal.SharedSlice> {
	if ("model" in args) {
		return args.model;
	}

	const { model } = await args.actions.readSliceModel({
		libraryID: args.libraryID,
		sliceID: args.sliceID,
	});

	return model;
}
