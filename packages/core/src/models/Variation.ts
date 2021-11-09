import * as t from 'io-ts';
import { Field } from "./CustomType/fields";

export enum WidgetsArea {
  Primary = "primary",
  Items = "items",
}

export const AsArray = t.array(t.type({ key: t.string, value: Field }))
export type AsArray = t.TypeOf<typeof AsArray>

export const AsObject = t.record(t.string, Field);
export type AsObject = t.TypeOf<typeof AsObject>

export const Variation = <T = AsObject | AsArray>(formatReader: t.Type<T>) => t.intersection([
  t.type({
    id: t.string,
    name: t.string,
    description: t.string,
    imageUrl: t.string,
    docURL: t.string,
    version: t.string,
  }),
  t.partial({
    primary: formatReader,
    items: formatReader,
    display: t.string,
  })
])

export const VariationAsObject = Variation(AsObject)
export type VariationAsObject = t.TypeOf<typeof VariationAsObject>

export const VariationAsArray = Variation(AsArray)
export type VariationAsArray = t.TypeOf<typeof VariationAsArray>

export const VariationMock = t.type({
  variation: t.string,
  name: t.string,
  slice_type: t.string,
  items: t.array(t.unknown),
  primary: t.record(t.string, t.unknown)
})
export type VariationMock = t.TypeOf<typeof VariationMock>
