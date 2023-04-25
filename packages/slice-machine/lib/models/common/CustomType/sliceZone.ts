import {
  SlicesTypes,
  CompositeSlice,
  LegacySlice,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SlicesSM } from "../Slices";
import { ComponentUI } from "../ComponentUI";

export type NonSharedSliceInSliceZone = {
  key: string;
  value: LegacySlice | CompositeSlice;
};
export interface SliceZoneSlice {
  type: SlicesTypes;
  payload: ComponentUI | NonSharedSliceInSliceZone;
}

export const SliceZone = {
  addSharedSlice(sz: SlicesSM, key: string): SlicesSM {
    const value = sz.value.concat([
      {
        key,
        value: {
          type: "SharedSlice",
        },
      },
    ]);
    return {
      ...sz,
      value,
    };
  },
  replaceSharedSlice(
    sz: SlicesSM,
    keys: ReadonlyArray<string>,
    preserve: ReadonlyArray<string> = []
  ): SlicesSM {
    const value = sz.value
      .filter(({ key }) => preserve.includes(key))
      .concat(
        keys.map((key) => ({
          key,
          value: { type: "SharedSlice" },
        }))
      );
    return {
      ...sz,
      value,
    };
  },
  removeSharedSlice(sz: SlicesSM, key: string): SlicesSM {
    const value = sz.value.filter(({ key: k }) => k !== key);

    return {
      ...sz,
      value,
    };
  },
  createEmpty(key: string): SlicesSM {
    return { key, value: [] };
  },
};
