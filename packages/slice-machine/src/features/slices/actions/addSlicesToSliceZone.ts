import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@/apiClient";
import { CustomTypeSM } from "@/legacy/lib/models/common/CustomType";

export type AddSlicesToSliceZoneArgs = {
  customType: CustomTypeSM;
  tabId: string;
  slices: SharedSlice[];
};

export function addSlicesToSliceZone({
  customType,
  tabId,
  slices,
}: AddSlicesToSliceZoneArgs) {
  let newCustomType: CustomTypeSM = { ...customType };

  slices.forEach((slice) => {
    newCustomType = {
      ...newCustomType,
      tabs: newCustomType.tabs.map((tab) =>
        tab.key === tabId && tab.sliceZone
          ? {
              ...tab,
              sliceZone: {
                key: tab.sliceZone.key,
                value: [
                  {
                    key: slice.id,
                    value: slice,
                  },
                  ...tab.sliceZone.value,
                ],
              },
            }
          : tab,
      ),
    };
  });

  void telemetry.track({
    event: "custom-type:slice-zone-updated",
    customTypeId: customType.id,
  });

  return newCustomType;
}
