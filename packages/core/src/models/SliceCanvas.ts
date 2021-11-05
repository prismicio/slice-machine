import * as t from 'io-ts';

import { VariationMock } from './SliceMock'

export const SliceState = t.exact(
  t.type({
    model: t.type({
      id: t.string,
    }),
    mock: t.record(t.string, VariationMock),
    previewURLs: t.record(
      t.string,
      t.type({
        hasPreview: t.boolean,
        path: t.union([t.string, t.undefined]),
      })
    ),
  })
);
export type SliceState = t.TypeOf<typeof SliceState>;

export const GlobalState = t.record(t.string, t.record(t.string, SliceState))

export type GlobalState = t.TypeOf<typeof GlobalState>;
