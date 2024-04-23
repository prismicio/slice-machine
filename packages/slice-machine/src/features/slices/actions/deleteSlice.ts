import { toast } from "react-toastify";

import { managerClient } from "@/managerClient";

type DeleteSliceArgs = {
  libraryID: string;
  sliceID: string;
  sliceName: string;
  onSuccess: () => void;
};

export async function deleteSlice(args: DeleteSliceArgs) {
  const { sliceName, sliceID, libraryID, onSuccess } = args;

  try {
    const { errors } = await managerClient.slices.deleteSlice({
      libraryID,
      sliceID,
    });

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess();

    toast.success(`Successfully deleted slice “${sliceName}”`);
  } catch (e) {
    const errorMessage = `An unexpected error happened while deleting slice “${sliceName}”.`;
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
