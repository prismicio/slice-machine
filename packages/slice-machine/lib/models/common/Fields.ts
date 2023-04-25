import * as t from "io-ts";
import { NestableWidget } from "@prismicio/types-internal/lib/customtypes";

export const FieldsSM = t.array(
  t.type({ key: t.string, value: NestableWidget })
);
export type FieldsSM = t.TypeOf<typeof FieldsSM>;
