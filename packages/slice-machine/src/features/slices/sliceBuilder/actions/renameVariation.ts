import { toast } from "react-toastify";

import {
  readSlice,
  readSliceMocks,
  renameSliceVariation,
  updateSlice,
} from "@/apiClient";
import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import type { VariationSM } from "@/legacy/lib/models/common/Slice";

type RenameVariationArgs = {
  component: ComponentUI;
  saveSliceSuccess: (component: ComponentUI) => void;
  variation: VariationSM;
  variationName: string;
};

export async function renameVariation(
  args: RenameVariationArgs,
): Promise<ComponentUI> {
  try {
    // The slice may have been edited so we need to update the file system.
    const { errors: updateSliceErrors } = await updateSlice(args.component);
    if (updateSliceErrors.length > 0) {
      throw updateSliceErrors;
    }

    // Now, rename the variation and save the slice.
    const { errors: renameSliceVariationErrors } = await renameSliceVariation(
      args.component,
      { ...args.variation, name: args.variationName },
    );
    if (renameSliceVariationErrors.length > 0) {
      throw renameSliceVariationErrors;
    }
    const { slice, errors: readSliceErrors } = await readSlice(
      args.component.from,
      args.component.model.id,
    );
    if (readSliceErrors.length > 0) {
      throw readSliceErrors;
    }
    if (!slice) {
      throw new Error(`Could not read variation \`${args.variation.name}\``);
    }
    const { mocks } = await readSliceMocks({
      libraryID: args.component.from,
      sliceID: args.component.model.id,
    });

    const newComponent = { ...args.component, model: slice, mocks };
    args.saveSliceSuccess(newComponent);

    return newComponent;
  } catch (error) {
    const message = `Could not rename variation \`${args.variation.name}\``;
    console.error(message, error);

    toast.error(message);

    throw error;
  }
}
