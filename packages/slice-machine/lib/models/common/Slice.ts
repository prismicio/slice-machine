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

export interface SliceCreateBody {
  sliceName: string;
  from: string;
  values?: { componentCode: string; model: Models.SliceAsObject };
}

export interface SliceSaveBody {
  sliceName: string;
  from: string;
  model: Models.SliceAsObject;
  mockConfig?: SliceMockConfig;
}

export interface SliceSaveResponse {
  screenshots: Screenshots;
  warning: string | null;
}

export default Slice;
