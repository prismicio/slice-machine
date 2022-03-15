import { VariationSM } from "@slicemachine/core/build/src/models";
import { ComponentUI, LibStatus, ScreenshotUI } from "../common/ComponentUI";

interface SliceState extends ComponentUI {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockConfig: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialMockConfig: any;

  remoteVariations: ReadonlyArray<VariationSM>;
  initialVariations: ReadonlyArray<VariationSM>;
  variations: ReadonlyArray<VariationSM>;

  initialScreenshotUrls?: {
    [variationId: string]: ScreenshotUI;
  };

  isTouched?: boolean;
  __status: LibStatus;
}

const SliceState = {
  variation(state: SliceState, variationId?: string): VariationSM | undefined {
    if (state.variations.length) {
      if (variationId)
        return state.variations.find((v) => v.id === variationId);
      return state.variations[0];
    }
  },

  updateVariation(state: SliceState, variationId: string) {
    return (mutate: (v: VariationSM) => VariationSM): SliceState => {
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
