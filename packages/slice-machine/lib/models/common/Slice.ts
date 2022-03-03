import type Models from "@slicemachine/core/build/src/models";
import { SliceMockConfig } from "./MockConfig";
import { Screenshots } from "./Screenshots";
import { Variation } from "./Variation";

const Slice = {
  toObject(slice: Models.SliceAsArray): Models.SliceAsObject {
    return {
      ...slice,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      variations: slice.variations.map(Variation.toObject),
    };
  },

  toArray(slice: Models.SliceAsObject): Models.SliceAsArray {
    return {
      ...slice,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      variations: slice.variations.map(Variation.toArray),
    };
  },
};

export interface SliceBody {
  sliceName: string;
  from: string;
}

export interface SliceSaveBody extends SliceBody {
  model: Models.SliceAsObject;
  mockConfig?: SliceMockConfig;
}

export interface SliceSaveResponse {
  screenshots: Screenshots;
  warning: string | null;
}

export interface SliceCreateResponse extends SliceSaveResponse {
  variationId: string;
}

export default Slice;
