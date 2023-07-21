import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import {
  CompositeSlice,
  LegacySlice,
  SharedSliceRef,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { DynamicSlices } from "@prismicio/types-internal/lib/customtypes/widgets/slices/Slices";

export const SlicesSM = t.type({
  key: t.string,
  value: t.array(
    t.type({
      key: t.string,
      value: t.union([LegacySlice, CompositeSlice, SharedSliceRef]),
    })
  ),
});
export type SlicesSM = t.TypeOf<typeof SlicesSM>;

export const SliceZone = {
  fromSM(slices: SlicesSM): DynamicSlices {
    return getOrElseW(() => {
      throw new Error("Error while parsing an SM slicezone");
    })(
      DynamicSlices.decode({
        type: "Slices",
        fieldset: "Slice Zone",
        config: {
          choices: slices.value.reduce(
            (acc, { key, value }) => ({ ...acc, [key]: value }),
            {}
          ),
        },
      })
    );
  },

  toSM(key: string, slices: DynamicSlices): SlicesSM {
    return getOrElseW(() => {
      throw new Error("Error while parsing a prismic slicezone");
    })(
      SlicesSM.decode({
        key,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        value: Object.entries(slices.config?.choices || []).map(
          ([key, value]) => ({ key, value })
        ),
      })
    );
  },
};
