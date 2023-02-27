import { CustomTypeMockConfig } from "../MockConfig";
import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";
import { SlicesSM } from "@slicemachine/core/build/models/Slices";

export interface SaveCustomTypeBody {
  model: CustomTypeSM;
  mockConfig: CustomTypeMockConfig;
}

export interface RenameCustomTypeBody {
  customTypeId: string;
  newCustomTypeName: string;
}

export type DeleteCustomTypeQuery = {
  id: string;
};

export type DeleteCustomTypeResponse =
  | { err: unknown; reason: string; status: number; type: "error" | "warning" }
  | Record<string, never>;

export const CustomType = {
  getSliceZones(ct: CustomTypeSM): ReadonlyArray<SlicesSM | null> {
    return ct.tabs.map((t) => t.sliceZone || null);
  },
};
