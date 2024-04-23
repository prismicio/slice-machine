import type { NextRouter } from "next/router";
import { toast } from "react-toastify";

import {
  deleteSliceVariation,
  readSlice,
  readSliceMocks,
  updateSlice,
} from "@/apiClient";
import { SLICES_CONFIG } from "@/features/slices/slicesConfig";
import type { ComponentUI } from "@/legacy/lib/models/common/ComponentUI";
import type { VariationSM } from "@/legacy/lib/models/common/Slice";

type DeleteVariationArgs = {
  component: ComponentUI;
  router: NextRouter;
  saveSliceSuccess: (component: ComponentUI) => void;
  variation: VariationSM;
};

export async function deleteVariation(
  args: DeleteVariationArgs,
): Promise<ComponentUI> {
  try {
    // The slice may have been edited so we need to update the file system.
    const { errors: updateSliceErrors } = await updateSlice(args.component);
    if (updateSliceErrors.length > 0) {
      throw updateSliceErrors;
    }

    // Now, delete the variation and save the slice.
    const { errors: deleteSliceVariationErrors } = await deleteSliceVariation({
      libraryID: args.component.from,
      sliceID: args.component.model.id,
      variationID: args.variation.id,
    });
    if (deleteSliceVariationErrors.length > 0) {
      throw deleteSliceVariationErrors;
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
    const url = SLICES_CONFIG.getBuilderPagePathname({
      libraryName: args.component.href,
      sliceName: slice.name,
      variationId: slice.variations[0].id,
    });
    await args.router.replace(url);

    const newComponent = { ...args.component, model: slice, mocks };
    args.saveSliceSuccess(newComponent);

    return newComponent;
  } catch (error) {
    const message = `Could not delete variation \`${args.variation.name}\``;
    console.error(message, error);

    toast.error(message);

    throw error;
  }
}
