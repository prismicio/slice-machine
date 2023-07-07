import { toast } from "react-toastify";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { pascalize, snakelize } from "@lib/utils/str";
import { managerClient } from "@src/managerClient";
import { telemetry } from "@src/apiClient";

type CreateSliceArgs = {
  sliceName: string;
  libraryName: string;
  onSuccess: (newSlice: SharedSlice) => Promise<void>;
};

export async function createSlice(args: CreateSliceArgs) {
  try {
    const { sliceName, libraryName, onSuccess } = args;
    const newSlice = buildEmptySliceModel(sliceName);
    const { errors } = await managerClient.slices.createSlice({
      libraryID: libraryName,
      model: newSlice,
    });

    if (errors.length > 0) {
      throw errors;
    }

    void telemetry.track({
      event: "slice:created",
      id: pascalize(sliceName),
      name: sliceName,
      library: libraryName,
    });

    await onSuccess(newSlice);

    toast.success("Slice saved");
  } catch (e) {
    const errorMessage = "Internal Error: Slice not created";
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}

const DEFAULT_VARIATION_ID = "default";

function buildEmptySliceModel(sliceName: string): SharedSlice {
  return {
    id: snakelize(sliceName),
    type: "SharedSlice",
    name: sliceName,
    description: sliceName,
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
