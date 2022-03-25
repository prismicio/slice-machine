import { CustomTypeMockConfig } from "../MockConfig";
import { CustomTypeSM } from "@slicemachine/core/build/src/models/CustomType";
import { SlicesSM } from "@slicemachine/core/build/src/models/Slices";

export interface SaveCustomTypeBody {
  model: CustomTypeSM;
  mockConfig: CustomTypeMockConfig;
}

export const CustomType = {
  getSliceZones(ct: CustomTypeSM): ReadonlyArray<SlicesSM | null> {
    return ct.tabs.map((t) => t.sliceZone || null);
  },
};
