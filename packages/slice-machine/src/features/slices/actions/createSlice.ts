import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";
import { toast } from "react-toastify";

import { buildEmptySliceModel } from "@/domain/slice";
import { managerClient } from "@/managerClient";

type CreateSliceArgs = {
  sliceName: string;
  libraryName: string;
  onSuccess: (newSlice: SharedSlice) => void;
};

export async function createSlice(args: CreateSliceArgs) {
  const { sliceName, libraryName, onSuccess } = args;

  try {
    const newSlice = buildEmptySliceModel(sliceName);
    const { errors } = await managerClient.slices.createSlice({
      libraryID: libraryName,
      model: newSlice,
    });

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess(newSlice);
  } catch (e) {
    const errorMessage = `An unexpected error happened while creating slice ${sliceName}.`;
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
