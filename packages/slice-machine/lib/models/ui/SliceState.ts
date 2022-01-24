import type Models from "@slicemachine/core/build/src/models";
import { ComponentUI, LibStatus, ScreenshotUI } from "../common/ComponentUI";

interface SliceState extends ComponentUI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;

  remoteVariations: ReadonlyArray<Models.VariationAsArray>;
  initialVariations: ReadonlyArray<Models.VariationAsArray>;
  variations: ReadonlyArray<Models.VariationAsArray>;

  initialScreenshotUrls?: {
    [variationId: string]: ScreenshotUI;
  };

  isTouched?: boolean;
  __status: LibStatus;
}

const SliceState = {
  variation(
    state: SliceState,
    variationId?: string
  ): Models.VariationAsArray | undefined {
    if (state.variations.length) {
      if (variationId)
        return state.variations.find((v) => v.id === variationId);
      return state.variations[0];
    }
  },

  updateVariation(state: SliceState, variationId: string) {
    return (
      mutate: (v: Models.VariationAsArray) => Models.VariationAsArray
    ): SliceState => {
      const variations = state.variations.map((v) => {
        if (v.id === variationId) return mutate(v);
        else return v;
      });

      return {
        ...state,
        variations,
      };
    };
  },
};

export default SliceState;
