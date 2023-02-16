import * as t from "io-ts";
import { SharedSlice } from "@prismicio/types-internal/lib/customtypes/widgets/slices";
import { CustomType } from "@prismicio/types-internal/lib/customtypes";

export enum ChangeTypes {
  SLICE_INSERT = "SLICE_INSERT",
  SLICE_UPDATE = "SLICE_UPDATE",
  SLICE_DELETE = "SLICE_DELETE",
  CUSTOM_TYPE_INSERT = "CUSTOM_TYPE_INSERT",
  CUSTOM_TYPE_UPDATE = "CUSTOM_TYPE_UPDATE",
  CUSTOM_TYPE_DELETE = "CUSTOM_TYPE_DELETE",
}

/* General validator to validate the POST body */
interface Change {
  type: ChangeTypes;
  id: string;
  payload: Record<string, unknown>;
}

interface DeleteChange extends Change {
  payload: { id: Change["id"] };
}

export interface SliceInsertChange extends Change {
  type: ChangeTypes.SLICE_INSERT;
  payload: SharedSlice;
}

export interface SliceUpdateChange extends Change {
  type: ChangeTypes.SLICE_UPDATE;
  payload: SharedSlice;
}

export interface SliceDeleteChange extends DeleteChange {
  type: ChangeTypes.SLICE_DELETE;
}

export interface CustomTypeInsertChange extends Change {
  type: ChangeTypes.CUSTOM_TYPE_INSERT;
  payload: CustomType;
}

export interface CustomTypeUpdateChange extends Change {
  type: ChangeTypes.CUSTOM_TYPE_UPDATE;
  payload: CustomType;
}

export interface CustomTypeDeleteChange extends DeleteChange {
  type: ChangeTypes.CUSTOM_TYPE_DELETE;
}

// Body expected by the custom type API
export interface BulkBody extends Record<string, unknown> {
  confirmDeleteDocuments: boolean;
  changes: (
    | SliceInsertChange
    | SliceUpdateChange
    | SliceDeleteChange
    | CustomTypeInsertChange
    | CustomTypeUpdateChange
    | CustomTypeDeleteChange
  )[];
}

// Potential limit returned by the custom type API
export const RawLimit = t.type({
  details: t.type({
    customTypes: t.array(
      t.type({
        id: t.string,
        numberOfDocuments: t.number,
        url: t.string,
      })
    ),
  }),
});
export type RawLimit = t.TypeOf<typeof RawLimit>;

// Limit type used to communicate the severity of the limit.
export enum LimitType {
  SOFT = "SOFT",
  HARD = "HARD",
}
export type Limit = RawLimit & { type: LimitType };
