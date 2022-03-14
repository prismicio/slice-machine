import * as t from "io-ts";
import { SliceAsObject } from "./Slice";
import { VariationMock } from "./Variation";

export const ComponentMocksRecord = t.record(t.string, VariationMock);
export type ComponentMocksRecord = t.TypeOf<typeof ComponentMocksRecord>;

export const ComponentMeta = t.type({
  fileName: t.union([t.string, t.null]),
  isDirectory: t.boolean,
  extension: t.union([t.string, t.null]),
});
export type ComponentMeta = t.TypeOf<typeof ComponentMeta>;

const ComponentScreenshots = t.record(
  t.string,
  t.type({
    path: t.union([t.string, t.undefined]),
    width: t.union([t.number, t.undefined]),
    height: t.union([t.number, t.undefined]),
  })
);

export type ComponentScreenshots = t.TypeOf<typeof ComponentScreenshots>;

export const Component = t.intersection([
  t.type({
    id: t.string,
    library: t.string,
    model: SliceAsObject,
    mocks: ComponentMocksRecord,
    meta: ComponentMeta,
  }),
  t.partial({
    screenshotPaths: ComponentScreenshots,
    name: t.string,
    description: t.string,
  }),
]);
export type Component = t.TypeOf<typeof Component>;

// dictionnary of componentId -> component
export const Library = t.type({
  name: t.union([t.string, t.undefined]),
  version: t.union([t.string, t.undefined]),
  components: t.record(t.string, Component),
});
export type Library = t.TypeOf<typeof Library>;

// dictionnary of libraryId -> components
export const Libraries = t.record(t.string, Library);
export type Libraries = t.TypeOf<typeof Libraries>;
