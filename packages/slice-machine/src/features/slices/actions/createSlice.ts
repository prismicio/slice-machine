import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { toast } from "react-toastify";

import { telemetry } from "@/apiClient";
import { buildEmptySliceModel } from "@/domain/slice";
import { pascalize } from "@/legacy/lib/utils/str";
import { managerClient } from "@/managerClient";

type CreateSliceArgs = {
  sliceName: string;
  libraryName: string;
  location: "custom_type" | "page_type" | "slices";
  onSuccess: (newSlice: SharedSlice) => Promise<void>;
};

export async function createSlice(args: CreateSliceArgs) {
  const { sliceName, libraryName, location, onSuccess } = args;

  try {
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
      location,
      mode: "manual",
    });

    await onSuccess(newSlice);
  } catch (e) {
    const errorMessage = `An unexpected error happened while creating slice ${sliceName}.`;
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
