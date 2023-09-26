import { SharedSlice } from "@prismicio/types-internal/lib/customtypes";

import { telemetry } from "@src/apiClient";
import { managerClient } from "@src/managerClient";
import { CustomTypeSM, CustomTypes } from "@lib/models/common/CustomType";

export type AddSlicesToSliceZoneArgs = {
  customType: CustomTypeSM;
  tabId: string;
  slices: SharedSlice[];
};

export async function addSlicesToSliceZone({
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
                  ...tab.sliceZone.value,
                  {
                    key: slice.id,
                    value: slice,
                  },
                ],
              },
            }
          : tab
      ),
    };
  });

  await managerClient.customTypes.updateCustomType({
    model: CustomTypes.fromSM(newCustomType),
  });

  void telemetry.track({
    event: "custom-type:slice-zone-updated",
    customTypeId: customType.id,
  });

  return newCustomType;
}
