import type { Dispatch, SetStateAction } from "react";

import type { SliceBuilderState } from "@builders/SliceBuilder";
import { SliceToastMessage } from "@components/ToasterContainer";
import type { ComponentUI } from "@lib/models/common/ComponentUI";
import type { VariationSM } from "@lib/models/common/Slice";
import {
  readSlice,
  readSliceMocks,
  renameSliceVariation,
  updateSlice,
} from "@src/apiClient";

type RenameVariationArgs = {
  component: ComponentUI;
  setSliceBuilderState: Dispatch<SetStateAction<SliceBuilderState>>;
  updateAndSaveSlice: (component: ComponentUI) => void;
  variation: VariationSM;
  variationName: string;
};

export async function renameVariation(
  args: RenameVariationArgs,
): Promise<void> {
  args.setSliceBuilderState({ loading: true, done: false });

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
    args.updateAndSaveSlice({ ...args.component, model: slice, mocks });

    // Finally, display a success toast.
    const path = `${args.component.from}/${args.component.model.name}/model.json`;
    args.setSliceBuilderState({
      loading: false,
      done: true,
      error: false,
      message: SliceToastMessage({ path }),
    });
  } catch (error) {
    const message = `Could not rename variation \`${args.variation.name}\``;
    console.error(message, error);

    // Display a failure toast.
    args.setSliceBuilderState({
      loading: false,
      done: true,
      error: true,
      message,
    });

    throw error;
  }
}
