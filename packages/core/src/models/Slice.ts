import * as t from "io-ts";

import {
  SlicesTypes,
  SharedSlice,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes/widgets/nestable";
import { getOrElseW } from "fp-ts/lib/Either";

export enum WidgetsArea {
  Primary = "primary",
  Items = "items",
}

export const FieldsSM = t.array(
  t.type({ key: t.string, value: NestableWidget })
);
export type FieldsSM = t.TypeOf<typeof FieldsSM>;

export const VariationSM = t.intersection([
  t.type({
    id: t.string,
    name: t.string,
    description: t.string,
    docURL: t.string,
    version: t.string,
  }),
  t.partial({
    imageUrl: t.string,
    primary: FieldsSM,
    items: FieldsSM,
    display: t.string,
  }),
]);
export type VariationSM = t.TypeOf<typeof VariationSM>;

export const VariationMock = t.type({
  variation: t.string,
  name: t.string,
  slice_type: t.string,
  items: t.array(t.unknown),
  primary: t.record(t.string, t.unknown),
});
export type VariationMock = t.TypeOf<typeof VariationMock>;

export const SliceMock = t.array(VariationMock);
export type SliceMock = t.TypeOf<typeof SliceMock>;

export const SliceSM = t.intersection([
  t.type({
    id: t.string,
    type: t.literal(SlicesTypes.SharedSlice),
    name: t.string,
    variations: t.array(VariationSM),
  }),
  t.partial({
    description: t.string,
  }),
]);

export type SliceSM = t.TypeOf<typeof SliceSM>;

export const Variations = {
  fromSM(variation: VariationSM): Variation {
    return getOrElseW(() => {
      throw new Error("Error while parsing an SM slice variation.");
    })(
      Variation.decode({
        ...variation,
        primary: variation.primary?.reduce(
          (acc, { key, value }) => ({ ...acc, [key]: value }),
          {}
        ),
        items: variation.items?.reduce(
          (acc, { key, value }) => ({ ...acc, [key]: value }),
          {}
        ),
      })
    );
  },

  toSM(variation: Variation): VariationSM {
    return getOrElseW(() => {
      throw new Error("Error while parsing a prismic slice variation.");
    })(
      VariationSM.decode({
        ...variation,
        primary: Object.entries(variation.primary || {}).map(
          ([key, value]) => ({
            key,
            value,
          })
        ),
        items: Object.entries(variation.items || {}).map(([key, value]) => ({
          key,
          value,
        })),
      })
    );
  },
};
export const Slices = {
  fromSM(slice: SliceSM): SharedSlice {
    return getOrElseW(() => {
      throw new Error("Error while prismic an SM prismic slice");
    })(
      SharedSlice.decode({
        ...slice,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        variations: slice.variations.map(Variations.fromSM),
      })
    );
  },

  toSM(slice: SharedSlice): SliceSM {
    return getOrElseW(() => {
      throw new Error("Error while prismic a prismic slice");
    })(
      SliceSM.decode({
        ...slice,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        variations: slice.variations.map(Variations.toSM),
      })
    );
  },
};
