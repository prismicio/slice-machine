import type { Models } from "@slicemachine/models";
import { Variation } from "./Variation";

const Slice = {
  toObject(slice: Models.SliceAsArray): Models.SliceAsObject {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toObject),
    };
  },

  toArray(slice: Models.SliceAsObject): Models.SliceAsArray {
    return {
      ...slice,
      variations: slice.variations.map(Variation.toArray),
    };
  },
};

export default Slice;
