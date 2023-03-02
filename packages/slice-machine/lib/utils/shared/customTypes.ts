import { CustomTypeSM } from "@lib/models/common/CustomType";

export const filterSliceFromCustomType = <T extends CustomTypeSM | undefined>(
  ct: T,
  sliceId: string
): T => {
  if (ct === undefined) {
    return ct;
  }

  return {
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
  };
};
