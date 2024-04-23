import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";
import * as t from "io-ts";

export const FieldsSM = t.array(
  t.type({ key: t.string, value: NestableWidget }),
);
export type FieldsSM = t.TypeOf<typeof FieldsSM>;
