import { CustomTypeMockConfig } from "../MockConfig";
import { CustomTypeSM } from "@core/models/CustomType";
import { SlicesSM } from "@core/models/Slices";

export interface SaveCustomTypeBody {
  model: CustomTypeSM;
  mockConfig: CustomTypeMockConfig;
}

export interface RenameCustomTypeBody {
  customTypeId: string;
  newCustomTypeName: string;
}

export const CustomType = {
  getSliceZones(ct: CustomTypeSM): ReadonlyArray<SlicesSM | null> {
    return ct.tabs.map((t) => t.sliceZone || null);
  },
};
