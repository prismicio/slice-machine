import { AsArray, AsObject, Variation } from "./Variation";

export interface Slice<F extends AsArray | AsObject> {
  id: string;
  type: "SharedSlice";
  name: string;
  description?: string;
  variations: ReadonlyArray<Variation<F>>;
}