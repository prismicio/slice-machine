import { CustomTypeSM } from "@slicemachine/core/build/models/CustomType";

export const filterSliceFromCustomType = (
  ct: CustomTypeSM,
  sliceId: string
): CustomTypeSM => ({
  ...ct,
  tabs: ct.tabs.map((tab) => {
    if (!tab.sliceZone) return tab;
    return {
      ...tab,
      sliceZone: {
        ...tab.sliceZone,
        value: tab.sliceZone?.value.filter((val) => val.key !== sliceId),
      },
    };
  }),
});
