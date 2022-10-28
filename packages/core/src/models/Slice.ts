import * as t from "io-ts";

import {
  SlicesTypes,
  SharedSlice,
  Variation,
} from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { getOrElseW } from "fp-ts/lib/Either";
import { FieldsSM } from "./Fields";
import { FieldContentType } from "@prismicio/types-internal/lib/documents/widgets/nestable/FieldContent";
import {
  EmptyContentType,
  GroupItemContentType,
  UIDContentType,
} from "@prismicio/types-internal/lib/documents/widgets";
import {
  EmbedContent,
  GeoPointContent,
  ImageContent,
  SeparatorContentType,
  Blocks,
  Links,
  StructuredTextContentType,
} from "@prismicio/types-internal/lib/documents/widgets/nestable";
import { SharedSliceContentType } from "@prismicio/types-internal/lib/documents/widgets/slices";
import { IntegrationFieldsContentType } from "@prismicio/types-internal/lib/documents/widgets/nestable/IntegrationFieldsContent";
import { BooleanContentType } from "@prismicio/types-internal/lib/documents/widgets/nestable/BooleanContent";
import { LinkContentType } from "@prismicio/types-internal/lib/documents/widgets/nestable/Link/LinkContent";

const IMAGE_PLACEHOLDER_URL =
  "https://images.prismic.io/slice-machine/621a5ec4-0387-4bc5-9860-2dd46cbc07cd_default_ss.png?auto=compress,format";

const FieldTypes: Record<string, null> = [
  "Text",
  "Date",
  "Timestamp",
  "Color",
  "Number",
  "Range",
  "Select",
].reduce((acc, curr) => {
  return { ...acc, [curr]: null };
}, {}); // this causes some issues

export const SimpleWidgetContent = t.union([
  ImageContent,
  GeoPointContent, // weird that geo has no __TYPE__
  EmbedContent,
  t.type({
    __TYPE__: t.literal(SeparatorContentType),
  }),
  t.type({
    __TYPE__: t.literal(EmptyContentType),
    type: t.string,
  }),
  t.type({
    __TYPE__: t.literal(FieldContentType),
    type: t.keyof(FieldTypes),
    value: t.string,
  }),
  t.type({
    __TYPE__: t.literal(StructuredTextContentType),
    value: t.array(Blocks.Block),
  }),
  t.type({
    __TYPE__: t.literal(IntegrationFieldsContentType),
    value: t.string,
  }),
  t.type({
    __TYPE__: t.literal(BooleanContentType),
    value: t.boolean,
  }),
  t.type({
    __TYPE__: t.literal(UIDContentType),
    value: t.string,
  }),
  t.type({
    __TYPE__: t.literal(LinkContentType),
    value: Links.Link,
  }),
]);

const GroupItemContent = t.type({
  __TYPE__: t.literal(GroupItemContentType),
  value: t.array(t.tuple([t.string, SimpleWidgetContent])),
});

export const VariationMock = t.type({
  variation: t.string,
  primary: t.record(t.string, SimpleWidgetContent),
  items: t.array(GroupItemContent),
  __TYPE__: t.literal(SharedSliceContentType),
});

export type VariationMock = t.TypeOf<typeof VariationMock>;

export enum WidgetsArea {
  Primary = "primary",
  Items = "items",
}

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
        imageUrl:
          variation.imageUrl === IMAGE_PLACEHOLDER_URL
            ? undefined
            : variation.imageUrl,
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
