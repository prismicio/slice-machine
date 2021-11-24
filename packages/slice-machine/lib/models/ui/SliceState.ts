import type { Models } from "@slicemachine/core";
import { ComponentUI, LibStatus } from "../common/ComponentUI";

interface SliceState extends ComponentUI {
  mockConfig: any;
  initialMockConfig: any;

  remoteVariations: ReadonlyArray<Models.VariationAsArray>;
  initialVariations: ReadonlyArray<Models.VariationAsArray>;
  variations: ReadonlyArray<Models.VariationAsArray>;

  initialPreviewUrls?: {
    [variationId: string]: Models.Preview;
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
