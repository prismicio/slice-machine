import { toast } from "react-toastify";

import { rename } from "@/domain/slice";
import { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import { Slices } from "@/legacy/lib/models/common/Slice";
import { managerClient } from "@/managerClient";

type DeleteSliceArgs = {
  newSliceName: string;
  slice: ComponentUI;
  onSuccess: (renamedSlice: ComponentUI) => void;
};

export async function renameSlice(args: DeleteSliceArgs) {
  const { slice, newSliceName, onSuccess } = args;

  try {
    const renamedSlice = rename(slice, newSliceName);

    const { errors } = await managerClient.slices.renameSlice({
      libraryID: slice.from,
      model: Slices.fromSM(renamedSlice.model),
    });

    if (errors.length > 0) {
      throw errors;
    }

    onSuccess(renamedSlice);

    toast.success("Slice name updated");
  } catch (e) {
    const errorMessage = `An unexpected error happened while renaming “${slice.model.name}”.`;
    console.error(errorMessage, e);
    toast.error(errorMessage);
  }
}
