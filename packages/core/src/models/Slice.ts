import * as t from "io-ts";
import { AsArray, AsObject, Variation } from "./Variation";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const Slice = <T = AsArray | AsObject>(formatReader: t.Type<T>) => {
  return t.intersection([
    t.type({
      id: t.string,
      type: t.literal("SharedSlice"),
      name: t.string,
      variations: t.array(Variation(formatReader)),
    }),
    t.partial({
      description: t.string,
    }),
  ]);
};

export const SliceAsArray = Slice(AsArray);
export type SliceAsArray = t.TypeOf<typeof SliceAsArray>;

export const SliceAsObject = Slice(AsObject);
export type SliceAsObject = t.TypeOf<typeof SliceAsObject>;
