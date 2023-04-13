import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { DEFAULT_VARIATION_ID } from "@lib/consts";

import { pascalize, snakelize } from "../str";

type BuildEmptySliceModelArgs = {
  sliceName: string;
};

export function buildEmptySliceModel(
  args: BuildEmptySliceModelArgs
): SharedSlice {
  return {
    id: snakelize(args.sliceName),
    type: "SharedSlice",
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
