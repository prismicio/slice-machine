import {
  SlicesTypes,
  CompositeSlice,
  LegacySlice,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { SlicesSM } from "@slicemachine/core/build/models/Slices";
import { ExtendedComponentUI } from "@src/modules/selectedSlice/types";

export type NonSharedSliceInSliceZone = {
  key: string;
  value: LegacySlice | CompositeSlice;
};
export interface SliceZoneSlice {
  type: SlicesTypes;
  payload: ExtendedComponentUI | NonSharedSliceInSliceZone;
}

export const SliceZone = {
  addSharedSlice(sz: SlicesSM, key: string): SlicesSM {
    const value = sz.value.concat([
      {
        key,
        value: {
          type: SlicesTypes.SharedSlice,
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
          value: { type: SlicesTypes.SharedSlice },
        }))
      );
    return {
      ...sz,
      value,
    };
  },
  removeSharedSlice(sz: SlicesSM, key: string): SlicesSM {
    const value = sz.value.filter(({ key: k }) => k === key);

    return {
      ...sz,
      value,
    };
  },
  createEmpty(key: string): SlicesSM {
    return { key, value: [] };
  },
};
