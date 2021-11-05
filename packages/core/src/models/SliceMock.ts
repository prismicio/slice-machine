import * as t from 'io-ts';

export const VariationMock = t.type({
  variation: t.string,
  name: t.string,
  slice_type: t.string,
  items: t.array(t.unknown),
  primary: t.record(t.string, t.unknown)
})

export type VariationMock = t.TypeOf<typeof VariationMock>

export const SliceMock = t.array(VariationMock)
export type SliceMock = t.TypeOf<typeof SliceMock>