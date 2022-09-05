import * as t from "io-ts";
import { getOrElseW } from "fp-ts/lib/Either";
import {
  CompositeSlice,
  LegacySlice,
  SharedSliceRef,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { DynamicSlices } from "@prismicio/types-internal/lib/customtypes/widgets/slices/Slices";
import { WidgetTypes } from "@prismicio/types-internal/lib/customtypes/widgets";

export const SlicesSM = t.type({
  key: t.string,
  value: t.array(
    t.type({
      key: t.string,
      value: t.intersection([
        t.union([LegacySlice, CompositeSlice, SharedSliceRef]),
        t.partial({
          imageHash: t.string, // hash of the screenshot in the file system
        }),
      ]),
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
        type: WidgetTypes.Slices,
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
        value: Object.entries(slices.config?.choices || []).map(
          ([key, value]) => ({ key, value })
        ),
      })
    );
  },
};
