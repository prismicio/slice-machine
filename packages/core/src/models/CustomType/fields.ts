import * as t from 'io-ts';
import { sliceZoneType } from "./sliceZone";

export enum FieldType {
  Boolean = "Boolean",
  GeoPoint = "GeoPoint",
  Select = "Select",
  Color = "Color",
  Group = "Group",
  StructuredText = "StructuredText",
  Image = "Image",
  Text = "Text",
  Date = "Date",
  Link = "Link",
  LinkToMedia = "Link",
  ContentRelationship = "Link",
  Timestamp = "Timestamp",
  Embed = "Embed",
  Number = "Number",
  UID = "UID",
}

export const FieldTypeCodec = t.keyof({
  Boolean: null,
  GeoPoint: null,
  Select: null,
  Color: null,
  Group: null,
  StructuredText: null,
  Image: null,
  Text: null,
  Date: null,
  Link: null,
  LinkToMedia: null,
  ContentRelationship: null,
  Timestamp: null,
  Embed: null,
  Number: null,
  UID: null,
})

export interface SimpleField {
  label: string;
  placeholder: string;
}
export const SimpleField = {
  default: { label: "", placeholder: "" },
};

export const Field = t.intersection([
  t.type({
    type: t.union([t.keyof({ [sliceZoneType]: null }), FieldTypeCodec]),
    config: t.unknown
  }),
  t.partial({
    fieldset: t.string
  })
])

export type Field = t.TypeOf<typeof Field>
