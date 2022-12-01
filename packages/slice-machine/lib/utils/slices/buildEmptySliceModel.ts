import { CustomTypes } from "@prismicio/types-internal";

import { DEFAULT_VARIATION_ID } from "@lib/consts";

import { pascalize, snakelize } from "../str";

type BuildEmptySliceModelArgs = {
  sliceName: string;
};

export function buildEmptySliceModel(
  args: BuildEmptySliceModelArgs
): CustomTypes.Widgets.Slices.SharedSlice {
  return {
    id: snakelize(args.sliceName),
    type: CustomTypes.Widgets.Slices.SlicesTypes.SharedSlice,
    name: args.sliceName,
    description: args.sliceName,
    variations: [
      {
        id: DEFAULT_VARIATION_ID,
        name: pascalize(DEFAULT_VARIATION_ID),
        // TODO: What should this be?
        docURL: "...",
        // TODO: What should this be?
        version: "initial",
        description: pascalize(DEFAULT_VARIATION_ID),
        // TODO: What should this be? The type requires it.
        imageUrl: "",
      },
    ],
  };
}
